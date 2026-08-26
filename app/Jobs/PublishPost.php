<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use App\Models\Post;
use App\Models\SocialAccount;
use App\Models\AuditLog;
use App\Notifications\PostPublished;
use App\Notifications\PostFailed;

class PublishPost implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60; // seconds between retries

    public function __construct(public Post $post) {}

    public function handle(): void
    {
        $post    = $this->post->fresh()->load('socialAccount');
        $account = $post->socialAccount;

        if (!$account || $account->status !== 'active') {
            $this->failPost($post, 'Social account is not connected or inactive.');
            return;
        }

        $post->update(['status' => 'publishing']);

        try {
            $token  = Crypt::decryptString($account->access_token);
            $result = match ($account->platform) {
                'facebook'  => $this->publishToFacebook($post, $account, $token),
                'instagram' => $this->publishToInstagram($post, $account, $token),
                'linkedin'  => $this->publishToLinkedIn($post, $account, $token),
                default     => throw new \Exception("Unsupported platform: {$account->platform}"),
            };

            $post->update([
                'status'           => 'published',
                'published_at'     => now(),
                'platform_post_id' => $result['platform_post_id'] ?? null,
                'error_message'    => null,
            ]);

            // Notify user
            $post->user->notify(new PostPublished($post));

            AuditLog::create([
                'user_id'     => $post->user_id,
                'action'      => 'post.publish',
                'module'      => 'Content',
                'description' => "Post published to {$account->platform}: {$account->account_name}",
                'ip_address'  => '127.0.0.1',
            ]);

            Log::info("Post #{$post->id} published successfully to {$account->platform}.");

        } catch (\Exception $e) {
            $this->failPost($post, $e->getMessage());
        }
    }

    // ─── Facebook Graph API ───────────────────────────────────────────────────

    private function publishToFacebook(Post $post, SocialAccount $account, string $token): array
    {
        $pageId   = $account->platform_account_id;
        $payload  = ['message' => $this->buildContent($post), 'access_token' => $token];

        if ($post->media_path && in_array($post->post_type, ['image', 'carousel'])) {
            $mediaUrl = \Storage::url($post->media_path);
            $endpoint = "https://graph.facebook.com/v19.0/{$pageId}/photos";
            $payload['url'] = $mediaUrl;
        } elseif ($post->media_path && $post->post_type === 'video') {
            $endpoint = "https://graph.facebook.com/v19.0/{$pageId}/videos";
            $payload['file_url'] = \Storage::url($post->media_path);
        } else {
            $endpoint = "https://graph.facebook.com/v19.0/{$pageId}/feed";
        }

        $response = Http::post($endpoint, $payload);

        if (!$response->ok() || isset($response->json()['error'])) {
            $err = $response->json()['error']['message'] ?? 'Facebook API error';
            throw new \Exception($err);
        }

        return ['platform_post_id' => $response->json()['id']];
    }

    // ─── Instagram Graph API ──────────────────────────────────────────────────

    private function publishToInstagram(Post $post, SocialAccount $account, string $token): array
    {
        $igUserId = $account->platform_account_id;

        // Step 1: Create media container
        $containerPayload = ['caption' => $this->buildContent($post), 'access_token' => $token];

        if ($post->media_path && $post->post_type === 'image') {
            $containerPayload['image_url'] = \Storage::url($post->media_path);
            $containerPayload['media_type'] = 'IMAGE';
        } elseif ($post->media_path && $post->post_type === 'video') {
            $containerPayload['video_url'] = \Storage::url($post->media_path);
            $containerPayload['media_type'] = 'REELS';
        } else {
            throw new \Exception('Instagram requires at least one image or video.');
        }

        $containerResp = Http::post("https://graph.instagram.com/v19.0/{$igUserId}/media", $containerPayload);

        if (!$containerResp->ok()) {
            throw new \Exception('Failed to create Instagram media container.');
        }

        $containerId = $containerResp->json()['id'];

        // Step 2: Publish container
        $publishResp = Http::post("https://graph.instagram.com/v19.0/{$igUserId}/media_publish", [
            'creation_id'  => $containerId,
            'access_token' => $token,
        ]);

        if (!$publishResp->ok()) {
            throw new \Exception('Failed to publish Instagram media.');
        }

        return ['platform_post_id' => $publishResp->json()['id']];
    }

    // ─── LinkedIn API ─────────────────────────────────────────────────────────

    private function publishToLinkedIn(Post $post, SocialAccount $account, string $token): array
    {
        $authorUrn = "urn:li:person:{$account->platform_account_id}";

        $body = [
            'author'         => $authorUrn,
            'lifecycleState' => 'PUBLISHED',
            'specificContent' => [
                'com.linkedin.ugc.ShareContent' => [
                    'shareCommentary' => ['text' => $this->buildContent($post)],
                    'shareMediaCategory' => 'NONE',
                ],
            ],
            'visibility' => [
                'com.linkedin.ugc.MemberNetworkVisibility' => 'PUBLIC',
            ],
        ];

        if ($post->media_path && in_array($post->post_type, ['image', 'video'])) {
            $body['specificContent']['com.linkedin.ugc.ShareContent']['shareMediaCategory'] =
                $post->post_type === 'video' ? 'VIDEO' : 'IMAGE';
            // Note: LinkedIn requires multi-step upload for media; simplified here
        }

        $response = Http::withToken($token)
            ->withHeaders(['X-Restli-Protocol-Version' => '2.0.0'])
            ->post('https://api.linkedin.com/v2/ugcPosts', $body);

        if (!$response->ok()) {
            $err = $response->json()['message'] ?? 'LinkedIn API error';
            throw new \Exception($err);
        }

        return ['platform_post_id' => $response->header('x-linkedin-id')];
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function buildContent(Post $post): string
    {
        $parts = [$post->content];

        if ($post->hashtags) {
            $tags = collect(explode(' ', $post->hashtags))
                ->filter()
                ->map(fn ($t) => str_starts_with($t, '#') ? $t : "#{$t}")
                ->implode(' ');
            $parts[] = $tags;
        }

        if ($post->link) {
            $parts[] = $post->link;
        }

        return implode("\n\n", array_filter($parts));
    }

    private function failPost(Post $post, string $error): void
    {
        $post->update([
            'status'        => 'failed',
            'error_message' => $error,
        ]);

        $post->user->notify(new PostFailed($post, $error));

        Log::error("Post #{$post->id} failed: {$error}");
    }

    public function failed(\Throwable $exception): void
    {
        $this->failPost($this->post, $exception->getMessage());
    }
}
