<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Guarded;
use Illuminate\Database\Eloquent\Model;

#[Guarded(['id'])]
class CustomBlock extends Model
{
    protected $casts = [
        'is_active' => 'boolean',
    ];
}
