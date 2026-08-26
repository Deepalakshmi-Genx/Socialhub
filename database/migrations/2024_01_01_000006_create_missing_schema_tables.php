<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Pivot table for posts publishing to multiple accounts
        Schema::create('post_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('social_account_id')->constrained()->cascadeOnDelete();
            $table->string('platform_post_id')->nullable();
            $table->enum('status', ['draft', 'queued', 'publishing', 'scheduled', 'published', 'failed', 'cancelled'])->default('draft');
            $table->text('error_message')->nullable();
            $table->timestamps();
        });

        // Ad Sets
        Schema::create('ad_sets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campaign_id')->constrained()->cascadeOnDelete();
            $table->json('audience')->nullable();
            $table->decimal('budget', 10, 2)->default(0);
            $table->json('schedule')->nullable();
            $table->enum('status', ['draft', 'active', 'paused', 'completed'])->default('draft');
            $table->timestamps();
            $table->softDeletes();
        });

        // Ads
        Schema::create('ads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ad_set_id')->constrained()->cascadeOnDelete();
            $table->string('creative_id')->nullable();
            $table->string('platform_ad_id')->nullable();
            $table->enum('status', ['draft', 'active', 'paused', 'rejected'])->default('draft');
            $table->timestamps();
            $table->softDeletes();
        });

        // Analytics snapshots
        Schema::create('analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('platform', ['facebook', 'instagram', 'linkedin']);
            $table->unsignedBigInteger('account_id')->nullable(); // social_accounts.id
            $table->unsignedBigInteger('post_id')->nullable();
            $table->unsignedBigInteger('campaign_id')->nullable();
            $table->unsignedBigInteger('impressions')->default(0);
            $table->unsignedBigInteger('reach')->default(0);
            $table->unsignedBigInteger('clicks')->default(0);
            $table->unsignedBigInteger('engagement')->default(0);
            $table->decimal('spend', 10, 2)->default(0);
            $table->unsignedInteger('conversions')->default(0);
            $table->date('report_date');
            $table->timestamps();

            $table->index(['user_id', 'report_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics');
        Schema::dropIfExists('ads');
        Schema::dropIfExists('ad_sets');
        Schema::dropIfExists('post_accounts');
    }
};
