<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inspection extends Model
{
    protected $casts = ['completed_at' => 'immutable_datetime'];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function findings(): HasMany
    {
        return $this->hasMany(InspectionFinding::class);
    }
}
