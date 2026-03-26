<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCustomBlockRequest;
use App\Http\Requests\UpdateCustomBlockRequest;
use App\Http\Resources\CustomBlockResource;
use App\Models\CustomBlock;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomBlockController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        return Inertia::render('custom-blocks/index', [
            'blocks' => CustomBlockResource::collection(
                $request->user()
                    ->customBlocks()
                    ->search($request->input('search'))
                    ->status($request->input('status'))
                    ->latest()
                    ->paginate(10)
                    ->withQueryString()
            ),
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', 'all'),
            ],
            'stats' => [
                'total' => $request->user()->customBlocks()->count(),
                'active' => $request->user()->customBlocks()->where('is_active', true)->count(),
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('custom-blocks/editor');
    }

    public function store(StoreCustomBlockRequest $request)
    {
        $request->user()->customBlocks()->create($request->validated());

        return redirect()->route('custom-blocks.index');
    }

    public function edit(CustomBlock $customBlock)
    {
        $this->authorize('view', $customBlock);

        return Inertia::render('custom-blocks/editor', [
            'block' => new CustomBlockResource($customBlock),
        ]);
    }

    public function update(UpdateCustomBlockRequest $request, CustomBlock $customBlock)
    {
        $this->authorize('update', $customBlock);

        $customBlock->update($request->validated());

        return redirect()->route('custom-blocks.index');
    }

    public function destroy(CustomBlock $customBlock)
    {
        $this->authorize('delete', $customBlock);

        $customBlock->delete();

        return redirect()->route('custom-blocks.index');
    }

    public function preview(Request $request)
    {
        return Inertia::render('custom-blocks/preview', [
            'blocks' => CustomBlockResource::collection(
                $request->user()->customBlocks()->where('is_active', true)->get()
            ),
        ]);
    }

    public function toggle(CustomBlock $customBlock)
    {
        $this->authorize('update', $customBlock);

        $customBlock->update(['is_active' => ! $customBlock->is_active]);

        return back();
    }
}
