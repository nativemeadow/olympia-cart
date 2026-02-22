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

        // before we save the file we need to see if the file already exists in the storage, if it does we should not save it again, instead we should just create a new record in the database with the existing file path and name
        $existingMedia = Media::where('file_name', $request->file('file')->getClientOriginalName())->first();

        if ($existingMedia) {
            // the file already exists, so we just send an error message back to the user
            return redirect()->back()->withErrors(['file' => 'A file with the same name already exists. Please rename your file and try again.']);
        }

        $file = $request->file('file');

        // 1. Determine the correct storage path first
        if ($validated['type'] === env('CATEGORIES_IMAGE_TYPE', 'categories')) {
            $storagePath = env('CATEGORY_IMAGE_FOLDER', 'category_images');
        } else {
            $storagePath = env('PRODUCT_IMAGE_FOLDER', 'products');
        }
        // 2. Store the file only ONCE and capture the resulting path
        $path = $file->storeAs($storagePath, $file->getClientOriginalName(), 'public');

        if (empty($validated['title'])) {
            $validated['title'] = str_replace(['_', '-'], ' ', pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME));
        }

        Media::create([
            'title' => $validated['title'],
            'file_path' => $storagePath,
            'description' => $validated['description'] ?? null,
            'alt_text' => $validated['alt_text'] ?? null,
            'file_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'type' => $request->type,
        ]);

        return redirect()->route('dashboard.media')->with('success', 'Media uploaded successfully.');
    }

    public function edit(Media $media)
    {
        return Inertia::render('dashboard/media/update', [
            'media' => $media,
        ]);
    }

    public function update(Request $request, Media $media)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'alt_text' => 'nullable|string|max:255',
            'type' => 'sometimes|string|in:products,product-categories,faq,other',
            'file_name' => 'sometimes|string|max:255',
            'file' => 'nullable|file|mimes:jpg,jpeg,png,gif,pdf,webp|max:2048', // Changed to nullable
        ]);

        // Update text-based fields from the request.
        $media->fill($request->except('file'));

        // Handle the file upload only if a new file is present.
        if ($request->hasFile('file')) {
            // 1. Delete the old file to prevent orphaned files.
            if ($media->file_path) {
                Storage::disk('public')->delete($media->file_path);
            }

            // determine if the file already exists in the storage, if it does we should not save it again, instead we should just update the existing record in the database with the existing file path and name
            $existingMedia = Media::where('file_name', $request->file('file')->getClientOriginalName())->first();

            // if the file already exists we send an error message back to the 
            // user and not the same file name is not allowed to be uploaded 
            // twice, we want to prevent orphaned files in the storage and 
            // also prevent confusion for the users when they see multiple 
            // files with the same name
            if ($existingMedia && $request->file('file')->getClientOriginalName() !== $media->file_name) {
                return redirect()->back()->withErrors(['file' => 'A file with the same name already exists. Please rename your file and try again.']);
            }

            $file = $request->file('file');

            // 2. Determine the target directory based on the media type.
            $directory = match ($request->input('type', $media->type)) {
                'product-categories' => env('CATEGORY_IMAGE_FOLDER', 'category_images'),
                'products' => env('PRODUCT_IMAGE_FOLDER', 'products'),
                default => 'media',
            };

            // 3. Store the new file and get its path.
            $path = $file->storeAs($directory, $file->getClientOriginalName(), 'public');

            // 4. Update the model's file-specific properties.
            $media->file_path = $directory;
            $media->file_name = $file->getClientOriginalName(); // Use the original client name
            $media->mime_type = $file->getMimeType();
            $media->size = $file->getSize();
        }

        // Save all changes to the database.
        $media->save();

        return redirect()->back()->with('success', 'Media updated successfully.');
    }

    public function destroy(Media $media)
    {
        // Delete the file from storage
        Storage::disk('public')->delete($media->file_path);

        // Delete the record from the database
        $media->delete();

        return redirect()->route('dashboard.media')->with('success', 'Media deleted successfully.');
    }
}
