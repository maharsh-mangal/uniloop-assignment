<?php

use App\Http\Controllers\CustomBlockController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::resource('custom-blocks', CustomBlockController::class);
    Route::get('custom-blocks-preview', [CustomBlockController::class, 'preview'])->name('custom-blocks.preview');
    Route::patch('custom-blocks/{customBlock}/toggle', [CustomBlockController::class, 'toggle'])->name('custom-blocks.toggle');
    Route::get('custom-blocks-builder', [CustomBlockController::class, 'builder'])->name('custom-blocks.builder');
});

require __DIR__.'/settings.php';
