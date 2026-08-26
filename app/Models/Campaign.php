<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Campaign extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'social_account_id',
        'name',
        'platform',
        'objective',
        'status',
        'platform_campaign_id',
        'budget',
        'budget_type',
        'currency',
        'start_date',
        'end_date',
        'locations',
        'age_min',
        'age_max',
        'gender',
        'interests',
        'primary_text',
        'headline',
        'description',
        'cta',
        'destination_url',
        'ad_media_path',
        'spend',
        'impressions',
        'clicks',
        'ctr',
        'cpc',
        'conversions',
    ];

    protected $casts = [
        'locations' => 'array',
        'interests' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
        'budget' => 'decimal:2',
        'spend' => 'decimal:2',
        'ctr' => 'decimal:2',
        'cpc' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function socialAccount()
    {
        return $this->belongsTo(SocialAccount::class);
    }
}
