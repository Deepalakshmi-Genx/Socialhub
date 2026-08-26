<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Analytics;
use App\Models\Post;
use App\Models\Campaign;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $dateRange = $request->input('range', 30); // default last 30 days
        $startDate = Carbon::now()->subDays($dateRange);

        // Fetch aggregate stats from the new analytics table
        $aggregates = Analytics::where('user_id', $userId)
            ->where('report_date', '>=', $startDate)
            ->selectRaw('SUM(impressions) as total_impressions, SUM(engagement) as total_engagement, SUM(spend) as total_spend')
            ->first();

        // Get post specific analytics
        $topPosts = Post::where('user_id', $userId)
            ->where('status', 'published')
            ->orderBy('reach', 'desc')
            ->take(5)
            ->get();

        // Get campaign specific analytics
        $campaigns = Campaign::where('user_id', $userId)
            ->where('status', 'active')
            ->get(['name', 'platform', 'spend', 'conversions', 'impressions']);

        return response()->json([
            'success' => true,
            'overview' => $aggregates,
            'top_posts' => $topPosts,
            'active_campaigns' => $campaigns
        ]);
    }
}
