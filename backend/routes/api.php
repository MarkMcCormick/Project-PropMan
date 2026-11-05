<?php

use Illuminate\Support\Facades\Route;
use App\Models\Property;


Route::get('/health', fn () => response()->json(['status' => 'ok']));
Route::get('/properties', fn () => Property::all());
