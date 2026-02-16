<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\Collection;
use Inertia\Inertia;

class MediaController extends Controller
{
    //
    public function index(Request $request)
    {
        $sort = $request->query('sort_column', 'created_at');
        $order = $request->query('order', 'desc');
        $perPage = $request->query('per_page', 10);
        $searchTerm = $request->query('search_term', '');

        $media = Media::query()
            ->when($searchTerm, function ($query, $searchTerm) {
                $query->where('title', 'like', "%{$searchTerm}%")
                    ->orWhere('alt_text', 'like', "%{$searchTerm}%");
            })
            ->orderBy($sort, $order)
            ->paginate($perPage)
            ->withQueryString();

        // Transform the collection to add the full URL
        $media->through(function ($item) {
            // Use the asset() helper to generate the full, correct URL.
            $item->url = asset($item->file_path);
            return $item;
        });

        return Inertia::render('dashboard/media/index', [
            'media' => [
                'data' => $media->items(),
                'links' => $media->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $media->currentPage(),
                    'from' => $media->firstItem(),
                    'to' => $media->lastItem(),
                    'total' => $media->total(),
                    'path' => $media->path(),
                    'per_page' => $media->perPage(),
                    'last_page' => $media->lastPage(),
                ],
            ],
            'filters' => $request->only(['sort_column', 'order', 'per_page', 'search_term']),
        ]);
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'file_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'alt_text' => 'nullable|string|max:255',
            'file' => 'required|file|mimes:jpg,jpeg,png,gif,pdf,webp|max:2048',
            'type' => 'required|string|in:products,product-categories,faq,other',
        ]);

        if (!$request->hasFile('file')) {
            return redirect()->back()->withErrors(['file' => 'No file uploaded.']);
        }

        $file = $request->file('file');
        if ($validated['type'] === 'product-categories') {
            $file->store(env('SITE_CATEGORY_IMAGES_PATH'), 'public');
        } else {
            $file->store(env('SITE_PRODUCT_IMAGES_PATH'), 'public');
        }
        $path = $file->store($validated['type'], 'public');

        if (empty($validated['title'])) {
            $validated['title'] = str_replace(['_', '-'], ' ', pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME)); // strip off the extension for the title and replace underscores and or hyphens with spaces
        }

        Media::create([
            'title' => $validated['title'],
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'type' => $request->type,
        ]);

        return redirect()->route('dashboard.media.index')->with('success', 'Media uploaded successfully.');
    }

    public function edit(Media $media)
    {
        return Inertia::render('dashboard/media/update', [
            'media' => $media,
        ]);
    }

    public function update(Request $request, Media $media)
    {
        // get the current file from the database before we update it, so we can delete the old file if a new one is uploaded
        $currentFileName = $media->file_name;
        $currentType = $media->type;

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'alt_text' => 'nullable|string|max:255',
            'type' => 'sometimes|string|in:products,product-categories,faq,other',
            'file_name' => 'sometimes|string|max:255', // Allow file_name to be updated
            'file' => 'sometimes|file|mimes:jpg,jpeg,png,gif,pdf,webp|max:2048',
        ]);

        // First, update any text-based fields from the request.
        $media->fill($request->only(['title', 'description', 'alt_text', 'type', 'file_name']));

        // Then, handle the file upload if a new file is present or the type has changed.
        if ($request->hasFile('file') || ($request->filled('type') && $request->type != $currentType)) {
            // 1. Delete the old file to prevent orphaned files.
            Storage::disk('public')->delete($media->file_path . '/' . $currentFileName);

            $file = $request->file('file');

            // 2. Clearly determine the target directory based on the media type.
            $directory = match ($media->type) {
                'product-categories' => env('SITE_CATEGORY_IMAGES_PATH', 'product-categories'),
                'products' => env('SITE_PRODUCT_IMAGES_PATH', 'products'),
                default => 'media',
            };

            // 3. Store the new file in the determined directory.
            $newPath = $file->store($directory, 'public');

            // 4. Update the model's file-specific properties.
            $media->file_path = $newPath;
            $media->file_name = $file->hashName(); // Override with new hashed name
            $media->mime_type = $file->getMimeType();
            $media->size = $file->getSize();
        }

        // Finally, save all changes to the database.
        $media->save();

        return redirect()->back()->with('success', 'Media updated successfully.');
    }

    public function destroy(Media $media)
    {
        // Delete the file from storage
        Storage::disk('public')->delete($media->file_path . '/' . $media->file_name);

        // Delete the record from the database
        $media->delete();

        return redirect()->route('dashboard.media.index')->with('success', 'Media deleted successfully.');
    }
}
