<?php

namespace App\Http\Controllers;

use App\Models\CustomBlock;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomBlockController extends Controller
{
    public function index()
    {
        return Inertia::render('custom-blocks/index', [
            'blocks' => CustomBlock::latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('custom-blocks/editor');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255|unique:custom_blocks,type',
            'description' => 'nullable|string',
            'icon_name' => 'nullable|string|max:255',
            'source_code' => 'required|string',
        ]);

        CustomBlock::query()->create($validated);

        return redirect()->route('custom-blocks.index');
    }

    public function edit(CustomBlock $customBlock)
    {
        return Inertia::render('custom-blocks/editor', [
            'block' => $customBlock,
        ]);
    }

    public function update(Request $request, CustomBlock $customBlock)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:255|unique:custom_blocks,type,' . $customBlock->id,
            'description' => 'nullable|string',
            'icon_name' => 'nullable|string|max:255',
            'source_code' => 'required|string',
        ]);

        $customBlock->update($validated);

        return redirect()->route('custom-blocks.index');
    }

    public function destroy(CustomBlock $customBlock)
    {
        $customBlock->delete();

        return redirect()->route('custom-blocks.index');
    }
}
