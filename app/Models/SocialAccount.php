<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SocialAccount extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'platform',
        'platform_account_id',
        'account_name',
        'platform_type',
        'access_token',
        'refresh_token',
        'status',
        'followers',
        'scopes',
        'connected_at',
        'expires_at',
        'deleted_at',
    ];

    protected $casts = [
        'scopes' => 'array',
        'connected_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }
}
