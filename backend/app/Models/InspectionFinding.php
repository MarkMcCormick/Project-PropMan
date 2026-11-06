<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InspectionFinding extends Model
{
    protected $fillable = ['item', 'status', 'severity', 'notes', 'image_path'];
}
