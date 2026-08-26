<?php
// database/migrations/2024_01_01_000003_create_posts_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('social_account_id')->constrained()->cascadeOnDelete();
            $table->text('content')->nullable();
            $table->string('hashtags')->nullable();
            $table->string('link')->nullable();
            $table->enum('post_type', ['text', 'image', 'video', 'carousel', 'reel'])->default('text');
            $table->string('media_path')->nullable();
            $table->json('media_urls')->nullable(); // public CDN URLs
            $table->enum('status', ['draft', 'queued', 'publishing', 'scheduled', 'published', 'failed', 'cancelled'])->default('draft');
            $table->string('platform_post_id')->nullable(); // ID returned by the platform
            $table->text('error_message')->nullable();
            $table->unsignedTinyInteger('retry_count')->default(0);
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('published_at')->nullable();
            // Engagement stats (synced from platform analytics)
            $table->unsignedInteger('likes')->default(0);
            $table->unsignedInteger('comments')->default(0);
            $table->unsignedInteger('shares')->default(0);
            $table->unsignedInteger('impressions')->default(0);
            $table->unsignedInteger('reach')->default(0);
            $table->unsignedInteger('clicks')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
            $table->index('scheduled_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
