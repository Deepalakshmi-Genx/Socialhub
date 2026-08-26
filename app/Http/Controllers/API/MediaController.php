<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\Media;

class MediaController extends Controller
{
    public function index(Request $request)
    {
        $media = Media::where('user_id', $request->user()->id)->latest()->get();
        return response()->json(['success' => true, 'data' => $media]);
    }

    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:jpeg,png,jpg,gif,mp4,mov|max:51200', // max 50mb
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $file = $request->file('file');
        $path = $file->store('media', 'public');
        $type = str_starts_with($file->getMimeType(), 'video') ? 'video' : 'image';

        $media = Media::create([
            'user_id'           => $request->user()->id,
            'filename'          => $file->hashName(),
            'original_filename' => $file->getClientOriginalName(),
            'path'              => $path,
            'url'               => Storage::url($path),
            'mime_type'         => $file->getMimeType(),
            'type'              => $type,
            'size'              => $file->getSize(),
        ]);

        return response()->json(['success' => true, 'media' => $media], 201);
    }

    public function destroy(Request $request, int $id)
    {
        $media = Media::where('user_id', $request->user()->id)->findOrFail($id);
        Storage::disk('public')->delete($media->path);
        $media->delete();

        return response()->json(['success' => true, 'message' => 'Media deleted.']);
    }
}
