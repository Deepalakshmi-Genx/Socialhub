<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\AuditLog;
use App\Models\Post;

class AdminController extends Controller
{
    /**
     * Get system overview metrics.
     */
    public function index(Request $request)
    {
        // Require admin role middleware to have passed before hitting this.
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'success' => true,
            'stats' => [
                'total_users' => User::count(),
                'active_users' => User::where('status', 'active')->count(),
                'total_posts' => Post::count(),
                'api_errors' => AuditLog::where('module', 'API')->where('action', 'error')->count(),
            ]
        ]);
    }

    public function users(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        
        $users = User::paginate(20);
        return response()->json(['success' => true, 'data' => $users]);
    }

    public function auditLogs(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $logs = AuditLog::with('user')->latest()->paginate(50);
        return response()->json(['success' => true, 'data' => $logs]);
    }
}
