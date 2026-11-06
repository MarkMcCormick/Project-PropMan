<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Property extends Model
{
    public function inspections(): HasMany
    {
        return $this->hasMany(Inspection::class);
    }
}
