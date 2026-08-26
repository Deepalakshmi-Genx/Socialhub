<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ad extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'ad_set_id',
        'creative_id',
        'platform_ad_id',
        'status',
    ];

    public function adSet()
    {
        return $this->belongsTo(AdSet::class);
    }
}
