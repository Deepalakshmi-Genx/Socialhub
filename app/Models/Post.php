<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'social_account_id',
        'content',
        'hashtags',
        'link',
        'post_type',
        'media_path',
        'media_urls',
        'status',
        'platform_post_id',
        'error_message',
        'retry_count',
        'scheduled_at',
        'published_at',
        'likes',
        'comments',
        'shares',
        'impressions',
        'reach',
        'clicks',
    ];

    protected $casts = [
        'media_urls' => 'array',
        'scheduled_at' => 'datetime',
        'published_at' => 'datetime',
    ];

    protected function serializeDate(\DateTimeInterface $date)
    {
        return $date->format('Y-m-d H:i');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function socialAccount()
    {
        return $this->belongsTo(SocialAccount::class);
    }
}
