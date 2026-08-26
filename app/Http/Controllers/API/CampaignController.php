<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Campaign;
use App\Models\AdSet;
use App\Models\Ad;
use App\Models\AuditLog;

class CampaignController extends Controller
{
    public function index(Request $request)
    {
        $campaigns = Campaign::where('user_id', $request->user()->id)
            ->with(['socialAccount'])
            ->latest()
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $campaigns]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'social_account_id' => 'required|exists:social_accounts,id',
            'name'              => 'required|string|max:255',
            'platform'          => 'required|in:facebook,instagram,linkedin',
            'objective'         => 'required|string',
            'budget'            => 'required|numeric|min:1',
            'budget_type'       => 'required|in:daily,lifetime',
            'start_date'        => 'required|date',
            'locations'         => 'required|array',
            'primary_text'      => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $campaign = Campaign::create([
            'user_id'           => $request->user()->id,
            'social_account_id' => $request->social_account_id,
            'name'              => $request->name,
            'platform'          => $request->platform,
            'objective'         => $request->objective,
            'budget'            => $request->budget,
            'budget_type'       => $request->budget_type,
            'start_date'        => $request->start_date,
            'end_date'          => $request->end_date,
            'status'            => 'pending_review',
            
            // Ad details directly mapped to campaign for MVP simplicity (though we have AdSets/Ads for scalability)
            'locations'         => $request->locations,
            'age_min'           => $request->age_min ?? 18,
            'age_max'           => $request->age_max ?? 65,
            'gender'            => $request->gender ?? 'all',
            'interests'         => $request->interests,
            
            'primary_text'      => $request->primary_text,
            'headline'          => $request->headline,
            'description'       => $request->description,
            'cta'               => $request->cta ?? 'Learn More',
            'destination_url'   => $request->destination_url,
            'ad_media_path'     => $request->ad_media_path,
        ]);

        // Create initial AdSet & Ad
        $adSet = AdSet::create([
            'campaign_id' => $campaign->id,
            'audience'    => ['locations' => $request->locations],
            'budget'      => $request->budget,
            'status'      => 'active'
        ]);

        Ad::create([
            'ad_set_id' => $adSet->id,
            'status'    => 'active'
        ]);

        AuditLog::create([
            'user_id'     => $request->user()->id,
            'action'      => 'campaign.create',
            'module'      => 'Advertising',
            'description' => "Created campaign: {$campaign->name}",
            'ip_address'  => $request->ip(),
        ]);

        return response()->json(['success' => true, 'campaign' => $campaign], 201);
    }

    public function show(Request $request, int $id)
    {
        $campaign = Campaign::where('user_id', $request->user()->id)->findOrFail($id);
        return response()->json(['success' => true, 'campaign' => $campaign]);
    }

    public function pause(Request $request, int $id)
    {
        $campaign = Campaign::where('user_id', $request->user()->id)->findOrFail($id);
        $campaign->update(['status' => 'paused']);
        return response()->json(['success' => true, 'message' => 'Campaign paused.']);
    }

    public function resume(Request $request, int $id)
    {
        $campaign = Campaign::where('user_id', $request->user()->id)->findOrFail($id);
        $campaign->update(['status' => 'active']);
        return response()->json(['success' => true, 'message' => 'Campaign resumed.']);
    }
}
