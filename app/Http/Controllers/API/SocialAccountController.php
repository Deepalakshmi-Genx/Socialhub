<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use App\Models\SocialAccount;
use App\Models\AuditLog;

class SocialAccountController extends Controller
{
    // ─── Facebook OAuth ─────────────────────────────────────────────────────

    public function oauthMetaUrl(Request $request)
    {
        $startTime = microtime(true);
        \Log::info('oauthMetaUrl: Started');

        $type = $request->query('type', 'page');
        $target = $request->query('target');
        
        \Log::info('oauthMetaUrl: Resolving user...');
        $userId = $request->user() ? $request->user()->id : 1;
        
        \Log::info('oauthMetaUrl: Encrypting state...');
        $state = base64_encode(json_encode(['user_id' => $userId, 'type' => $type, 'target' => $target]));

        $scope = 'pages_show_list,business_management,pages_manage_posts,pages_read_engagement,ads_management,pages_read_user_content,instagram_basic,instagram_content_publish,instagram_manage_insights,instagram_manage_messages';
        if ($type === 'group') {
            $scope = 'publish_to_groups';
        }

        $appId = env('META_APP_ID') ?: '123456789';
        $redirectUri = env('META_REDIRECT_URI') ?: (env('APP_URL', 'http://localhost:8000') . '/api/oauth/facebook/callback');

        $paramsArray = [
            'client_id'     => $appId,
            'redirect_uri'  => $redirectUri,
            'state'         => $state,
            'response_type' => 'code',
        ];

        if (env('META_CONFIGURATION_ID')) {
            $paramsArray['config_id'] = env('META_CONFIGURATION_ID');
        } else {
            $paramsArray['scope'] = $scope;
        }

        $params = http_build_query($paramsArray);

        $endTime = microtime(true);
        \Log::info('oauthMetaUrl: Completed in ' . round($endTime - $startTime, 4) . ' seconds', ['url' => "https://www.facebook.com/v19.0/dialog/oauth?{$params}"]);

        return response()->json(['url' => "https://www.facebook.com/v19.0/dialog/oauth?{$params}"]);
    }

    public function oauthMetaCallback(Request $request)
    {
        $frontendUrl = rtrim(env('FRONTEND_URL') ?: url('/'), '/');
        if ($request->has('error') || !$request->has('state')) {
            return redirect($frontendUrl . '/accounts?error=oauth_failed');
        }

        try {
            $decrypted = Crypt::decryptString($request->state);
            $stateData = json_decode($decrypted, true);
        } catch (\Exception $e) {
            try {
                $stateData = json_decode(base64_decode($request->state), true);
            } catch (\Exception $ex) {
                $stateData = null;
            }
        }

        if (!$stateData || !isset($stateData['user_id'])) {
            \Log::error('Meta callback invalid state error: Failed to decode state');
            return redirect($frontendUrl . '/accounts?error=invalid_state');
        }

        $user = \App\Models\User::find($stateData['user_id']) ?: ($request->user() ?: \App\Models\User::first());
        $type = $stateData['type'] ?? 'page';
        $target = $stateData['target'] ?? null;

        // Exchange code for access token
        $response = Http::withoutVerifying()->get('https://graph.facebook.com/v19.0/oauth/access_token', [
            'client_id'     => env('META_APP_ID'),
            'client_secret' => env('META_APP_SECRET'),
            'redirect_uri'  => env('META_REDIRECT_URI'),
            'code'          => $request->code,
        ]);

        if (!$response->ok()) {
            \Log::error('Meta token exchange failed: ' . $response->body());
            return redirect($frontendUrl . '/accounts?error=token_exchange_failed');
        }

        $tokenData  = $response->json();
        $userToken  = $tokenData['access_token'];

        // Get long-lived token
        $llResponse = Http::withoutVerifying()->get('https://graph.facebook.com/v19.0/oauth/access_token', [
            'grant_type'        => 'fb_exchange_token',
            'client_id'         => env('META_APP_ID'),
            'client_secret'     => env('META_APP_SECRET'),
            'fb_exchange_token' => $userToken,
        ]);

        $longLivedToken = $llResponse->ok() ? $llResponse->json()['access_token'] : $userToken;

        // Get user pages or groups
        $endpoint = $type === 'group' ? 'me/groups' : 'me/accounts?fields=id,name,access_token,instagram_business_account{id,username,followers_count}';

        $pagesResponse = Http::withoutVerifying()->withToken($longLivedToken)
            ->get("https://graph.facebook.com/v19.0/{$endpoint}");

        if (!$pagesResponse->ok()) {
            return redirect($frontendUrl . '/accounts?error=pages_fetch_failed');
        }

        $pages = $pagesResponse->json()['data'] ?? [];

        \Log::info("Facebook {$type}s fetched for user " . $user->id, ['accounts' => $pages, 'raw_response' => $pagesResponse->json()]);

        $pendingAccounts = [];

        foreach ($pages as $page) {
            if (!$target || $target === 'facebook_page' || $target === 'facebook_group') {
                $pendingAccounts[] = [
                    'id'            => 'fb_' . $page['id'],
                    'platform'      => 'facebook',
                    'platform_account_id' => $page['id'],
                    'account_name'  => $page['name'],
                    'platform_type' => $type,
                    'access_token'  => Crypt::encryptString($type === 'group' ? $longLivedToken : $page['access_token']),
                ];
            }

            // Connect Instagram Business Account if it exists on the page
            if (isset($page['instagram_business_account'])) {
                $ig = $page['instagram_business_account'];
                $username = $ig['username'] ?? null;
                $followers = $ig['followers_count'] ?? 0;

                // Meta sometimes omits the username in the me/accounts edge, fetch it directly if needed
                if (!$target || $target === 'instagram') {
                    if (!$username) {
                        $igProfile = Http::withoutVerifying()->get("https://graph.facebook.com/v19.0/{$ig['id']}", [
                            'fields'       => 'username,followers_count',
                            'access_token' => $page['access_token']
                        ]);
                        if ($igProfile->ok()) {
                            $igData = $igProfile->json();
                            $username = $igData['username'] ?? 'unknown';
                            $followers = $igData['followers_count'] ?? 0;
                        } else {
                            $username = 'unknown';
                        }
                    }

                    $pendingAccounts[] = [
                        'id'            => 'ig_' . $ig['id'],
                        'platform'      => 'instagram',
                        'platform_account_id' => $ig['id'],
                        'account_name'  => '@' . $username,
                        'platform_type' => 'business',
                        'access_token'  => Crypt::encryptString($page['access_token']),
                        'followers'     => $followers,
                    ];
                }
            }
        }

        if (empty($pendingAccounts)) {
            return redirect($frontendUrl . '/accounts?error=no_accounts_found');
        }

        $cacheKey = (string) Str::uuid();
        Cache::put("meta_pending_{$cacheKey}", $pendingAccounts, now()->addMinutes(15));

        return redirect($frontendUrl . '/accounts?select_meta=' . $cacheKey);
    }

    public function getPendingMetaAccounts(Request $request)
    {
        $key = $request->query('key');
        if (!$key || !Cache::has("meta_pending_{$key}")) {
            return response()->json(['success' => false, 'error' => 'Session expired or invalid key'], 400);
        }

        $accounts = Cache::get("meta_pending_{$key}");
        // Remove access tokens before sending to frontend
        $safeAccounts = array_map(function ($acc) {
            unset($acc['access_token']);
            return $acc;
        }, $accounts);

        return response()->json(['success' => true, 'accounts' => $safeAccounts]);
    }

    public function confirmMetaAccounts(Request $request)
    {
        $request->validate([
            'key' => 'required|string',
            'selected_ids' => 'required|array',
        ]);

        $key = $request->input('key');
        $selectedIds = $request->input('selected_ids');

        if (!Cache::has("meta_pending_{$key}")) {
            return response()->json(['success' => false, 'error' => 'Session expired'], 400);
        }

        $accounts = Cache::get("meta_pending_{$key}");
        $user = $request->user();

        $savedAccounts = [];

        foreach ($accounts as $acc) {
            if (in_array($acc['id'], $selectedIds)) {
                $savedAccounts[] = SocialAccount::withTrashed()->updateOrCreate(
                    ['platform' => $acc['platform'], 'platform_account_id' => $acc['platform_account_id'], 'user_id' => $user->id],
                    [
                        'account_name'  => $acc['account_name'],
                        'platform_type' => $acc['platform_type'],
                        'access_token'  => $acc['access_token'],
                        'followers'     => $acc['followers'] ?? 0,
                        'status'        => 'active',
                        'connected_at'  => now(),
                        'deleted_at'    => null,
                    ]
                );
            }
        }

        Cache::forget("meta_pending_{$key}");

        AuditLog::create([
            'user_id'     => $user->id,
            'action'      => 'account.connect',
            'module'      => 'Accounts',
            'description' => count($savedAccounts) . ' Facebook/Instagram accounts connected.',
            'ip_address'  => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Accounts connected successfully',
        ]);
    }

    // ─── Instagram OAuth ─────────────────────────────────────────────────────

    public function oauthInstagram(Request $request)
    {
        $state  = Str::random(40);
        session(['oauth_state' => $state]);

        $params = http_build_query([
            'client_id'     => env('INSTAGRAM_APP_ID', env('META_APP_ID')),
            'redirect_uri'  => env('INSTAGRAM_REDIRECT_URI', url('/api/oauth/instagram/callback')),
            'state'         => $state,
            'scope'         => 'instagram_basic,instagram_content_publish,instagram_manage_insights',
            'response_type' => 'code',
        ]);

        return redirect("https://www.instagram.com/oauth/authorize?{$params}");
    }

    public function oauthInstagramCallback(Request $request)
    {
        if ($request->has('error') || $request->state !== session('oauth_state')) {
            return redirect(env('FRONTEND_URL') . '/accounts?error=oauth_failed');
        }

        // Exchange code for short-lived token
        $response = Http::asForm()->post('https://graph.instagram.com/v19.0/oauth/access_token', [
            'client_id'     => env('INSTAGRAM_APP_ID', env('META_APP_ID')),
            'client_secret' => env('INSTAGRAM_APP_SECRET', env('META_APP_SECRET')),
            'grant_type'    => 'authorization_code',
            'redirect_uri'  => env('INSTAGRAM_REDIRECT_URI', url('/api/oauth/instagram/callback')),
            'code'          => $request->code,
        ]);

        if (!$response->ok()) {
            return redirect(env('FRONTEND_URL') . '/accounts?error=token_exchange_failed');
        }

        $tokenData = $response->json();
        $shortToken = $tokenData['access_token'];
        $igUserId   = $tokenData['user_id'];

        // Get long-lived token (60 days)
        $llResponse = Http::get('https://graph.instagram.com/access_token', [
            'grant_type'        => 'ig_exchange_token',
            'client_secret'     => env('INSTAGRAM_APP_SECRET', env('META_APP_SECRET')),
            'access_token'      => $shortToken,
        ]);

        $longToken = $llResponse->ok() ? $llResponse->json()['access_token'] : $shortToken;

        // Get account info
        $profileResponse = Http::get("https://graph.instagram.com/{$igUserId}", [
            'fields'       => 'id,username,account_type,media_count,followers_count',
            'access_token' => $longToken,
        ]);

        $profile = $profileResponse->ok() ? $profileResponse->json() : ['id' => $igUserId, 'username' => 'unknown'];
        $user    = $request->user();

        SocialAccount::withTrashed()->updateOrCreate(
            ['platform' => 'instagram', 'platform_account_id' => $profile['id'], 'user_id' => $user->id],
            [
                'account_name'  => '@' . ($profile['username'] ?? 'unknown'),
                'platform_type' => 'business',
                'access_token'  => Crypt::encryptString($longToken),
                'followers'     => $profile['followers_count'] ?? 0,
                'status'        => 'active',
                'connected_at'  => now(),
                'expires_at'    => now()->addDays(60),
                'deleted_at'    => null,
            ]
        );

        return redirect(env('FRONTEND_URL') . '/accounts?success=instagram_connected');
    }

    // ─── LinkedIn OAuth ───────────────────────────────────────────────────────

    public function oauthLinkedIn(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $state  = Crypt::encryptString(json_encode(['user_id' => $user->id, 'random' => Str::random(20)]));

        $params = http_build_query([
            'response_type' => 'code',
            'client_id'     => env('LINKEDIN_CLIENT_ID'),
            'redirect_uri'  => env('LINKEDIN_REDIRECT_URI'),
            'state'         => $state,
            'scope'         => env('LINKEDIN_SCOPES', 'openid profile email w_member_social'),
        ]);

        return response()->json(['url' => "https://www.linkedin.com/oauth/v2/authorization?{$params}"]);
    }

    public function oauthLinkedInCallback(Request $request)
    {
        $frontendUrl = rtrim(env('FRONTEND_URL') ?: url('/'), '/');
        \Log::info('oauthLinkedInCallback: Reached', $request->all());

        if ($request->has('error')) {
            \Log::error("LinkedIn OAuth returned an error", $request->all());
            return redirect($frontendUrl . '/accounts?error=oauth_failed');
        }

        try {
            $decrypted = Crypt::decryptString($request->state);
            $stateData = json_decode($decrypted, true);
        } catch (\Exception $e) {
            try {
                $stateData = json_decode(base64_decode($request->state), true);
            } catch (\Exception $ex) {
                $stateData = null;
            }
        }

        if (!$stateData || !isset($stateData['user_id'])) {
            \Log::error("LinkedIn state decryption failed");
            return redirect($frontendUrl . '/accounts?error=invalid_state');
        }

        $response = Http::withoutVerifying()->asForm()->post('https://www.linkedin.com/oauth/v2/accessToken', [
            'grant_type'    => 'authorization_code',
            'code'          => $request->code,
            'redirect_uri'  => env('LINKEDIN_REDIRECT_URI'),
            'client_id'     => env('LINKEDIN_CLIENT_ID'),
            'client_secret' => env('LINKEDIN_CLIENT_SECRET'),
        ]);

        if (!$response->ok()) {
            return redirect($frontendUrl . '/accounts?error=token_exchange_failed');
        }

        $tokenData   = $response->json();
        $accessToken = $tokenData['access_token'];
        $expiresIn   = $tokenData['expires_in'] ?? 5183944; // ~60 days

        // Get member profile using OpenID Connect endpoint
        $profileResp = Http::withoutVerifying()->withToken($accessToken)
            ->get('https://api.linkedin.com/v2/userinfo');

        $profile = $profileResp->ok() ? $profileResp->json() : null;
        $name    = $profile ? ($profile['name'] ?? $profile['given_name'] . ' ' . $profile['family_name']) : 'LinkedIn User';
        $linkedinId = $profile ? ($profile['sub'] ?? Str::random(10)) : Str::random(10);

        SocialAccount::withTrashed()->updateOrCreate(
            ['platform' => 'linkedin', 'platform_account_id' => $linkedinId, 'user_id' => $user->id],
            [
                'account_name'  => $name,
                'platform_type' => 'personal',
                'access_token'  => Crypt::encryptString($accessToken),
                'status'        => 'active',
                'connected_at'  => now(),
                'expires_at'    => now()->addSeconds($expiresIn),
                'deleted_at'    => null,
            ]
        );

        return redirect($frontendUrl . '/accounts?success=linkedin_connected');
    }

    // ─── CRUD ────────────────────────────────────────────────────────────────

    public function index(Request $request)
    {
        $startTime = microtime(true);
        \Log::info('index (get accounts): Started');

        $accounts = SocialAccount::where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn ($a) => $this->formatAccount($a));

        $endTime = microtime(true);
        \Log::info('index (get accounts): Completed in ' . round($endTime - $startTime, 4) . ' seconds');

        return response()->json(['success' => true, 'accounts' => $accounts]);
    }

    public function show(Request $request, int $id)
    {
        $account = SocialAccount::where('user_id', $request->user()->id)->findOrFail($id);

        return response()->json(['success' => true, 'account' => $this->formatAccount($account)]);
    }

    public function disconnect(Request $request, int $id)
    {
        $account = SocialAccount::where('user_id', $request->user()->id)->findOrFail($id);
        $account->delete();

        AuditLog::create([
            'user_id'     => $request->user()->id,
            'action'      => 'account.disconnect',
            'module'      => 'Accounts',
            'description' => "Disconnected {$account->platform} account: {$account->account_name}",
            'ip_address'  => $request->ip(),
        ]);

        return response()->json(['success' => true, 'message' => 'Account disconnected.']);
    }

    public function reconnect(Request $request, int $id)
    {
        $account = SocialAccount::where('user_id', $request->user()->id)->findOrFail($id);

        // Redirect to the appropriate OAuth flow
        $platform = $account->platform;
        $oauthUrl = $platform === 'facebook' ? url('/api/auth/meta') : route("api.oauth.{$platform}");

        return response()->json(['success' => true, 'redirect_url' => $oauthUrl]);
    }

    public function checkStatus(Request $request, int $id)
    {
        $account = SocialAccount::where('user_id', $request->user()->id)->findOrFail($id);

        $isExpired = $account->expires_at && now()->isAfter($account->expires_at);
        if ($isExpired) {
            $account->update(['status' => 'expired']);
        }

        return response()->json([
            'success' => true,
            'status'  => $account->fresh()->status,
            'expired' => $isExpired,
        ]);
    }

    private function formatAccount(SocialAccount $account): array
    {
        return [
            'id'           => $account->id,
            'platform'     => $account->platform,
            'account_name' => $account->account_name,
            'platform_type'=> $account->platform_type,
            'status'       => $account->status,
            'followers'    => $account->followers,
            'connected_at' => $account->connected_at?->format('Y-m-d'),
            'expires_at'   => $account->expires_at?->format('Y-m-d H:i'),
        ];
    }
}
