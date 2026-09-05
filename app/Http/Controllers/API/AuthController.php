<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use App\Models\User;
use App\Models\AuditLog;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'mobile'   => 'required|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'company'  => 'required|string|max:255',
            'terms'    => 'required|accepted',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name'               => $request->name,
            'email'              => $request->email,
            'mobile'             => $request->mobile,
            'password'           => Hash::make($request->password),
            'company'            => $request->company,
            'status'             => 'pending',
            'email_verify_token' => Str::random(64),
        ]);

        // Send verification email
        Mail::to($user->email)->send(new \App\Mail\VerifyEmail($user));

        AuditLog::create([
            'user_id'     => $user->id,
            'action'      => 'user.register',
            'module'      => 'Authentication',
            'description' => "New user registered: {$user->email}",
            'ip_address'  => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registration successful. Please verify your email.',
            'user'    => $user->only(['id', 'name', 'email', 'company']),
        ], 201);
    }

    /**
     * Login with email and password.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.',
            ], 401);
        }

        if ($user->status === 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Please verify your email before logging in.',
            ], 403);
        }

        if ($user->status === 'inactive') {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated. Please contact support.',
            ], 403);
        }

        $token = $user->createToken('socialhub-token')->plainTextToken;

        AuditLog::create([
            'user_id'     => $user->id,
            'action'      => 'user.login',
            'module'      => 'Authentication',
            'description' => "User logged in: {$user->email}",
            'ip_address'  => $request->ip(),
        ]);

        return response()->json([
            'success' => true,
            'token'   => $token,
            'user'    => [
                'id'      => $user->id,
                'name'    => $user->name,
                'email'   => $user->email,
                'company' => $user->company,
                'role'    => $user->role,
                'plan'    => $user->plan ?? 'Free',
                'avatar'  => $user->avatar,
            ],
        ]);
    }

    /**
     * Logout.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['success' => true, 'message' => 'Logged out successfully.']);
    }

    /**
     * Get current authenticated user.
     */
    public function me(Request $request)
    {
        \Log::info('Auth /me endpoint called by user ID: ' . optional($request->user())->id);
        return response()->json([
            'success' => true,
            'user'    => $request->user(),
        ]);
    }

    /**
     * Send password reset link.
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $token = Str::random(64);
        Cache::put("password_reset_{$request->email}", $token, now()->addHours(1));

        Mail::to($request->email)->send(new \App\Mail\PasswordReset($token, $request->email));

        return response()->json(['success' => true, 'message' => 'Password reset link sent.']);
    }

    /**
     * Reset password.
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'token'    => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $cached = Cache::get("password_reset_{$request->email}");
        if (!$cached || $cached !== $request->token) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired reset token.'], 400);
        }

        $user = User::where('email', $request->email)->first();
        $user->update(['password' => Hash::make($request->password)]);
        Cache::forget("password_reset_{$request->email}");

        return response()->json(['success' => true, 'message' => 'Password reset successfully.']);
    }

    /**
     * Verify email.
     */
    public function verifyEmail(Request $request, string $token)
    {
        $user = User::where('email_verify_token', $token)->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Invalid verification token.'], 400);
        }

        $user->update([
            'status'               => 'active',
            'email_verified_at'    => now(),
            'email_verify_token'   => null,
        ]);

        return response()->json(['success' => true, 'message' => 'Email verified. You can now log in.']);
    }

    /**
     * Google SSO redirect.
     */
    public function oauthGoogle()
    {
        $params = http_build_query([
            'client_id'    => env('GOOGLE_CLIENT_ID'),
            'redirect_uri' => env('GOOGLE_REDIRECT_URI'),
            'response_type'=> 'code',
            'scope'        => 'openid email profile',
            'access_type'  => 'offline',
        ]);

        return redirect("https://accounts.google.com/o/oauth2/auth?{$params}");
    }

    /**
     * Google SSO callback.
     */
    public function oauthGoogleCallback(Request $request)
    {
        $frontendUrl = rtrim(env('FRONTEND_URL') ?: url('/'), '/');
        if ($request->has('error')) {
            return redirect($frontendUrl . '/login?error=oauth_denied');
        }

        // Exchange code for token
        // Note: withoutVerifying() is required on local dev (Windows SSL cert issue)
        \Log::info('Google SSO: Attempting token exchange with code: ' . $request->code);
        $response = \Illuminate\Support\Facades\Http::withoutVerifying()->post('https://oauth2.googleapis.com/token', [
            'code'          => $request->code,
            'client_id'     => env('GOOGLE_CLIENT_ID'),
            'client_secret' => env('GOOGLE_CLIENT_SECRET'),
            'redirect_uri'  => env('GOOGLE_REDIRECT_URI'),
            'grant_type'    => 'authorization_code',
        ]);

        if (!$response->ok()) {
            \Log::error('Google token exchange failed. Status: ' . $response->status() . ' Body: ' . $response->body());
            return redirect($frontendUrl . '/login?error=oauth_failed');
        }

        \Log::info('Google SSO: Token exchange successful');


        $tokenData = $response->json();

        // Get user info
        $userInfo = \Illuminate\Support\Facades\Http::withoutVerifying()->withToken($tokenData['access_token'])
            ->get('https://www.googleapis.com/oauth2/v2/userinfo')
            ->json();

        // Find or create user
        $user = User::firstOrCreate(
            ['email' => $userInfo['email']],
            [
                'name'             => $userInfo['name'] ?? 'Google User',
                'email_verified_at'=> now(),
                'status'           => 'active',
                'password'         => Hash::make(Str::random(32)),
                'sso_provider'     => 'google',
                'sso_id'           => $userInfo['id'] ?? null,
                'avatar'           => $userInfo['picture'] ?? null,
            ]
        );

        // Ensure user is active upon SSO login
        if ($user->status !== 'active') {
            $user->update(['status' => 'active', 'email_verified_at' => $user->email_verified_at ?? now()]);
        }

        $token = $user->createToken('socialhub-google-token')->plainTextToken;
        $encodedToken = rawurlencode($token);
        $name = rawurlencode($user->name ?? '');
        $email = rawurlencode($user->email ?? '');
        $avatar = rawurlencode($user->avatar ?? '');

        return redirect($frontendUrl . "/auth/sso?token={$encodedToken}&id={$user->id}&name={$name}&email={$email}&avatar={$avatar}");
    }

    /**
     * Update profile.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name'    => 'sometimes|string|max:255',
            'mobile'  => 'sometimes|string|max:20',
            'company' => 'sometimes|string|max:255',
            'bio'     => 'sometimes|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user->update($request->only(['name', 'mobile', 'company', 'bio']));

        return response()->json(['success' => true, 'user' => $user->fresh()]);
    }

    /**
     * Change password.
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'Current password is incorrect.'], 400);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['success' => true, 'message' => 'Password updated successfully.']);
    }

    /**
     * List active sessions.
     */
    public function sessions(Request $request)
    {
        $tokens = $request->user()->tokens()->get()->map(fn ($t) => [
            'id'         => $t->id,
            'name'       => $t->name,
            'last_used'  => $t->last_used_at,
            'created_at' => $t->created_at,
            'current'    => $t->id === $request->user()->currentAccessToken()->id,
        ]);

        return response()->json(['success' => true, 'sessions' => $tokens]);
    }

    /**
     * Revoke a session.
     */
    public function revokeSession(Request $request, int $id)
    {
        $request->user()->tokens()->where('id', $id)->delete();

        return response()->json(['success' => true, 'message' => 'Session revoked.']);
    }
}
