<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\Post;
use App\Models\SocialAccount;
use App\Jobs\PublishPost;
use App\Jobs\SchedulePost;
use App\Models\AuditLog;
use Carbon\Carbon;

class PostController extends Controller
{
    /**
     * List posts with optional filters.
     */
    public function index(Request $request)
    {
        $query = Post::where('user_id', $request->user()->id)
            ->with('socialAccount')
            ->latest();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('platform')) {
            $query->whereHas('socialAccount', fn ($q) => $q->where('platform', $request->platform));
        }
        if ($request->has('search')) {
            $query->where('content', 'like', "%{$request->search}%");
        }

        $posts = $query->paginate($request->get('per_page', 20));

        return response()->json(['success' => true, 'data' => $posts]);
    }

    /**
     * Create/draft a post.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'social_account_id' => 'required|exists:social_accounts,id',
            'content'           => 'required_without:media_path|nullable|string|max:63206',
            'hashtags'          => 'nullable|string',
            'link'              => 'nullable|url',
            'post_type'         => 'required|in:text,image,video,carousel',
            'media_path'        => 'nullable|string',
            'status'            => 'required|in:draft,scheduled,publish_now',
            'scheduled_at'      => 'required_if:status,scheduled|nullable|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Check account ownership
        $account = SocialAccount::where('user_id', $request->user()->id)
            ->where('id', $request->social_account_id)
            ->where('status', 'active')
            ->first();

        if (!$account) {
            return response()->json(['success' => false, 'message' => 'Social account not found or inactive.'], 404);
        }

        $post = Post::create([
            'user_id'           => $request->user()->id,
            'social_account_id' => $request->social_account_id,
            'content'           => $request->content,
            'hashtags'          => $request->hashtags,
            'link'              => $request->link,
            'post_type'         => $request->post_type ?? 'text',
            'media_path'        => $request->media_path,
            'status'            => $request->status === 'publish_now' ? 'queued' : ($request->status ?? 'draft'),
            'scheduled_at'      => $request->status === 'scheduled' ? Carbon::parse($request->scheduled_at) : null,
        ]);

        if ($request->status === 'publish_now') {
            PublishPost::dispatch($post);
        } elseif ($request->status === 'scheduled') {
            SchedulePost::dispatch($post)->delay(Carbon::parse($request->scheduled_at));
        }

        AuditLog::create([
            'user_id'     => $request->user()->id,
            'action'      => 'post.create',
            'module'      => 'Content',
            'description' => "Post created for {$account->platform}: {$account->account_name}",
            'ip_address'  => $request->ip(),
        ]);

        return response()->json(['success' => true, 'post' => $post->load('socialAccount')], 201);
    }

    /**
     * Show single post.
     */
    public function show(Request $request, int $id)
    {
        $post = Post::where('user_id', $request->user()->id)
            ->with(['socialAccount', 'analytics'])
            ->findOrFail($id);

        return response()->json(['success' => true, 'post' => $post]);
    }

    /**
     * Update draft or scheduled post.
     */
    public function update(Request $request, int $id)
    {
        $post = Post::where('user_id', $request->user()->id)
            ->whereIn('status', ['draft', 'scheduled'])
            ->findOrFail($id);

        $post->update($request->only(['content', 'hashtags', 'link', 'media_path', 'scheduled_at']));

        return response()->json(['success' => true, 'post' => $post->fresh()]);
    }

    /**
     * Delete post.
     */
    public function destroy(Request $request, int $id)
    {
        $post = Post::where('user_id', $request->user()->id)->findOrFail($id);
        $post->delete();

        return response()->json(['success' => true, 'message' => 'Post deleted.']);
    }

    /**
     * Immediately publish post.
     */
    public function publish(Request $request, int $id)
    {
        $post = Post::where('user_id', $request->user()->id)
            ->whereIn('status', ['draft', 'failed', 'cancelled'])
            ->findOrFail($id);

        $post->update(['status' => 'queued', 'scheduled_at' => null]);
        PublishPost::dispatch($post);

        return response()->json(['success' => true, 'message' => 'Post queued for publishing.', 'post' => $post->fresh()]);
    }

    /**
     * Schedule a post.
     */
    public function schedule(Request $request, int $id)
    {
        $validator = Validator::make($request->all(), [
            'scheduled_at' => 'required|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $post = Post::where('user_id', $request->user()->id)
            ->whereIn('status', ['draft'])
            ->findOrFail($id);

        $post->update([
            'status'       => 'scheduled',
            'scheduled_at' => Carbon::parse($request->scheduled_at),
        ]);

        SchedulePost::dispatch($post)->delay(Carbon::parse($request->scheduled_at));

        return response()->json(['success' => true, 'post' => $post->fresh()]);
    }

    /**
     * Cancel a scheduled post.
     */
    public function cancel(Request $request, int $id)
    {
        $post = Post::where('user_id', $request->user()->id)
            ->where('status', 'scheduled')
            ->findOrFail($id);

        $post->update(['status' => 'cancelled']);

        return response()->json(['success' => true, 'message' => 'Post cancelled.']);
    }

    /**
     * Retry a failed post.
     */
    public function retry(Request $request, int $id)
    {
        $post = Post::where('user_id', $request->user()->id)
            ->where('status', 'failed')
            ->findOrFail($id);

        $post->update(['status' => 'queued', 'error_message' => null, 'retry_count' => $post->retry_count + 1]);
        PublishPost::dispatch($post);

        return response()->json(['success' => true, 'message' => 'Retry queued.', 'post' => $post->fresh()]);
    }

    /**
     * Get post publishing status.
     */
    public function status(Request $request, int $id)
    {
        $post = Post::where('user_id', $request->user()->id)->findOrFail($id);

        return response()->json([
            'success'       => true,
            'status'        => $post->status,
            'published_at'  => $post->published_at,
            'error_message' => $post->error_message,
            'platform_id'   => $post->platform_post_id,
        ]);
    }

    /**
     * Calendar view: posts grouped by date.
     */
    public function calendar(Request $request)
    {
        $month  = $request->get('month', now()->month);
        $year   = $request->get('year', now()->year);

        $start = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $end   = $start->copy()->endOfMonth();

        $posts = Post::where('user_id', $request->user()->id)
            ->with('socialAccount')
            ->where(function ($q) use ($start, $end) {
                $q->whereBetween('scheduled_at', [$start, $end])
                  ->orWhereBetween('published_at', [$start, $end]);
            })
            ->get()
            ->groupBy(fn ($p) => ($p->scheduled_at ?? $p->published_at)?->format('Y-m-d'));

        return response()->json(['success' => true, 'calendar' => $posts]);
    }
}
