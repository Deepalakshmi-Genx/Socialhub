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

        // Organic (Posts)
        $postsAgg = Post::where('user_id', $userId)
            ->selectRaw('
                COUNT(id) as total_posts,
                SUM(impressions) as total_impressions,
                SUM(reach) as total_reach,
                SUM(likes + comments + shares) as total_engagement,
                SUM(clicks) as total_clicks,
                SUM(likes) as total_likes,
                SUM(comments) as total_comments,
                SUM(shares) as total_shares
            ')->first();

        $engagementRate = $postsAgg->total_impressions > 0 
            ? round(($postsAgg->total_engagement / $postsAgg->total_impressions) * 100, 2) 
            : 0;

        $organic = [
            'total_posts' => (int) $postsAgg->total_posts,
            'total_impressions' => (int) $postsAgg->total_impressions,
            'total_reach' => (int) $postsAgg->total_reach,
            'total_engagement' => (int) $postsAgg->total_engagement,
            'engagement_rate' => $engagementRate,
            'total_clicks' => (int) $postsAgg->total_clicks,
            'followers_growth' => 0.5,
            'total_likes' => (int) $postsAgg->total_likes,
            'total_comments' => (int) $postsAgg->total_comments,
            'total_shares' => (int) $postsAgg->total_shares,
        ];

        // Advertising (Campaigns)
        $campAgg = Campaign::where('user_id', $userId)
            ->selectRaw('
                SUM(spend) as total_spend,
                SUM(impressions) as total_impressions,
                SUM(clicks) as total_clicks,
                SUM(conversions) as total_conversions
            ')->first();

        $avgCtr = $campAgg->total_impressions > 0 
            ? round(($campAgg->total_clicks / $campAgg->total_impressions) * 100, 2) 
            : 0;
            
        $cpa = $campAgg->total_conversions > 0 
            ? round($campAgg->total_spend / $campAgg->total_conversions, 2) 
            : 0;

        $advertising = [
            'total_spend' => (float) $campAgg->total_spend,
            'total_impressions' => (int) $campAgg->total_impressions,
            'total_reach' => (int) ($campAgg->total_impressions * 0.75), // Est. reach
            'total_clicks' => (int) $campAgg->total_clicks,
            'avg_ctr' => $avgCtr,
            'conversions' => (int) $campAgg->total_conversions,
            'cpa' => $cpa,
            'roas' => 0,
        ];

        // Chart Data (Last 7 days mock from posts created_at)
        // Group by Date
        $startDate = Carbon::now()->subDays(6)->startOfDay();
        $dailyStats = Post::where('user_id', $userId)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, SUM(impressions) as imp, SUM(reach) as reach')
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $dayName = Carbon::now()->subDays($i)->format('D');
            
            $stat = $dailyStats->get($date);
            $chartData[] = [
                'date' => $dayName,
                'impressions' => $stat ? (int) $stat->imp : 0,
                'reach' => $stat ? (int) $stat->reach : 0,
            ];
        }

        return response()->json([
            'success' => true,
            'organic' => $organic,
            'advertising' => $advertising,
            'chart_data' => $chartData
        ]);
    }
}
