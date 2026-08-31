<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Post;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SimulateEngagement extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'socialhub:simulate-engagement';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync actual social media engagement (likes, comments) from Meta APIs for published posts';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Get all published posts that actually have a platform_post_id (real posts)
        $posts = Post::where('status', 'published')
            ->whereNotNull('platform_post_id')
            ->with('socialAccount')
            ->get();

        if ($posts->isEmpty()) {
            $this->info('No published posts found with platform IDs to sync.');
            return;
        }

        $count = 0;
        foreach ($posts as $post) {
            $account = $post->socialAccount;
            if (!$account || $account->status !== 'active') {
                continue;
            }

            try {
                $token = Crypt::decryptString($account->access_token);
                $platformId = $post->platform_post_id;

                if ($account->platform === 'instagram') {
                    $response = Http::withoutVerifying()
                        ->get("https://graph.facebook.com/v19.0/{$platformId}", [
                            'fields' => 'like_count,comments_count',
                            'access_token' => $token,
                        ]);

                    if ($response->successful()) {
                        $data = $response->json();
                        $post->update([
                            'likes' => $data['like_count'] ?? 0,
                            'comments' => $data['comments_count'] ?? 0,
                        ]);
                        $count++;
                    } else {
                        Log::warning("Instagram sync failed for post {$post->id}: " . $response->body());
                    }

                } elseif ($account->platform === 'facebook') {
                    $response = Http::withoutVerifying()
                        ->get("https://graph.facebook.com/v19.0/{$platformId}", [
                            'fields' => 'likes.summary(true),comments.summary(true),shares',
                            'access_token' => $token,
                        ]);

                    if ($response->successful()) {
                        $data = $response->json();
                        $post->update([
                            'likes' => $data['likes']['summary']['total_count'] ?? 0,
                            'comments' => $data['comments']['summary']['total_count'] ?? 0,
                            'shares' => $data['shares']['count'] ?? 0,
                        ]);
                        $count++;
                    } else {
                        Log::warning("Facebook sync failed for post {$post->id}: " . $response->body());
                    }
                }
            } catch (\Exception $e) {
                Log::error("Failed to sync engagement for post {$post->id}: " . $e->getMessage());
            }
        }

        $this->info("Successfully synced REAL engagement for {$count} published posts!");
    }
}
