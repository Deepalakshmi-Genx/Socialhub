<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    /**
     * Handle incoming webhooks from social platforms (Facebook/Instagram/LinkedIn).
     */
    public function handle(Request $request, $platform)
    {
        // For Meta (FB/IG) Verification Challenge
        if ($request->isMethod('get') && $request->has('hub_challenge')) {
            $verifyToken = env('META_WEBHOOK_VERIFY_TOKEN');
            if ($request->input('hub_verify_token') === $verifyToken) {
                return response($request->input('hub_challenge'), 200);
            }
            return response('Invalid verify token', 403);
        }

        // Handle POST events (e.g. ad status updates, engagement updates)
        $payload = $request->all();
        
        Log::info("Webhook received from {$platform}:", $payload);

        // Process the payload based on platform (e.g., update post status, trigger notifications)
        // Switch($platform) { ... }

        return response()->json(['success' => true]);
    }
}
