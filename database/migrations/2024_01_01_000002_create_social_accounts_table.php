<?php
// database/migrations/2024_01_01_000002_create_social_accounts_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('social_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('platform', ['facebook', 'instagram', 'linkedin']);
            $table->string('platform_account_id'); // page id, ig user id, li member id
            $table->string('account_name');
            $table->string('platform_type')->default('page'); // page, business, personal
            $table->text('access_token'); // encrypted
            $table->text('refresh_token')->nullable(); // encrypted
            $table->enum('status', ['active', 'expired', 'revoked'])->default('active');
            $table->bigInteger('followers')->default(0);
            $table->json('scopes')->nullable(); // granted scopes
            $table->timestamp('connected_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['user_id', 'platform', 'platform_account_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('social_accounts');
    }
};
