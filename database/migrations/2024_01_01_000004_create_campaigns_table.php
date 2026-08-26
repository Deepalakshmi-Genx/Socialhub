<?php
// database/migrations/2024_01_01_000004_create_campaigns_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('social_account_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->enum('platform', ['facebook', 'instagram', 'linkedin']);
            $table->string('objective'); // awareness, traffic, conversions, etc.
            $table->enum('status', ['draft', 'pending_review', 'active', 'paused', 'completed', 'rejected'])->default('draft');
            $table->string('platform_campaign_id')->nullable();
            $table->decimal('budget', 10, 2)->default(0);
            $table->enum('budget_type', ['daily', 'lifetime'])->default('daily');
            $table->string('currency', 3)->default('USD');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            // Audience
            $table->json('locations')->nullable();
            $table->unsignedTinyInteger('age_min')->default(18);
            $table->unsignedTinyInteger('age_max')->default(65);
            $table->enum('gender', ['all', 'male', 'female'])->default('all');
            $table->json('interests')->nullable();

            // Creative
            $table->text('primary_text')->nullable();
            $table->string('headline')->nullable();
            $table->string('description')->nullable();
            $table->string('cta', 50)->default('Learn More');
            $table->string('destination_url')->nullable();
            $table->string('ad_media_path')->nullable();

            // Performance metrics (synced)
            $table->decimal('spend', 10, 2)->default(0);
            $table->unsignedBigInteger('impressions')->default(0);
            $table->unsignedBigInteger('clicks')->default(0);
            $table->decimal('ctr', 5, 2)->default(0);
            $table->decimal('cpc', 10, 2)->default(0);
            $table->unsignedInteger('conversions')->default(0);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campaigns');
    }
};
