<?php

use Illuminate\Support\Facades\Route;
use App\Models\Property;
use Illuminate\Http\Request;
use App\Models\Inspection;

Route::get('/health', fn () => response()->json(['status' => 'ok']));
Route::get('/properties', fn () => Property::all());
Route::post('/inspections', function (Request $request) {
    $data = $request->validate([
        'inspector_name' => ['required', 'string', 'max:255'],
        'property_id' => ['required', 'integer', 'exists:properties,id'],
    ]);

    $inspection = new Inspection();
    $inspection->inspector_name = $data['inspector_name'];
    $inspection->property_id = $data['property_id'];
    $inspection->save();
    
    return response()->json($inspection, 201);});
Route::post('/properties', function (Request $request) {
    $data = $request->validate([
        'property_name' => ['required', 'string', 'max:255'],
        'image' => ['nullable', 'image', 'max:5120'],
    ]);


    $property = new Property();
    $property->property_name = $data['property_name'];
if ($request->hasFile('image')) {
    $path = $request->file('image')->store('properties', 'public');
    abort_if($path === false, 500, 'Could not save the property photo.');
    $property->main_image_path = $path;
}

    $property->save();

    return response()->json($property, 201);
});
