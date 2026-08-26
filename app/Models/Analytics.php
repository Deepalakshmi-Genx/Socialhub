<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Analytics extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'platform',
        'account_id',
        'post_id',
        'campaign_id',
        'impressions',
        'reach',
        'clicks',
        'engagement',
        'spend',
        'conversions',
        'report_date',
    ];

    protected $casts = [
        'report_date' => 'date',
        'spend'       => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
