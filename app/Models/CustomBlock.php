<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $name
 * @property string $type
 * @property string|null $description
 * @property string $icon_name
 * @property string $source_code
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 *
 * @method static Builder<static>|CustomBlock newModelQuery()
 * @method static Builder<static>|CustomBlock newQuery()
 * @method static Builder<static>|CustomBlock query()
 * @method static Builder<static>|CustomBlock search(?string $term)
 * @method static Builder<static>|CustomBlock status(?string $status)
 * @method static Builder<static>|CustomBlock whereCreatedAt($value)
 * @method static Builder<static>|CustomBlock whereDescription($value)
 * @method static Builder<static>|CustomBlock whereIconName($value)
 * @method static Builder<static>|CustomBlock whereId($value)
 * @method static Builder<static>|CustomBlock whereIsActive($value)
 * @method static Builder<static>|CustomBlock whereName($value)
 * @method static Builder<static>|CustomBlock whereSourceCode($value)
 * @method static Builder<static>|CustomBlock whereType($value)
 * @method static Builder<static>|CustomBlock whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class CustomBlock extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        if (! $term) {
            return $query;
        }

        return $query->where(function (Builder $q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
                ->orWhere('type', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%");
        });
    }

    public function scopeStatus(Builder $query, ?string $status): Builder
    {
        return match ($status) {
            'active' => $query->where('is_active', true),
            'inactive' => $query->where('is_active', false),
            default => $query,
        };
    }
}
