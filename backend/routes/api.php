<?php

use Illuminate\Support\Facades\Route;
use App\Models\Property;
use Illuminate\Http\Request;
use App\Models\Inspection;
use App\Http\Controllers\InspectionController;

Route::get('/health', fn () => response()->json(['status' => 'ok']));
Route::get('/properties', fn () => Property::all());
Route::get('/properties/overview', fn () => Property::query()
    ->with(['inspections' => fn ($inspections) => $inspections
        ->select('id', 'property_id', 'inspector_name', 'completed_at')
        ->whereNotNull('completed_at')
        ->latest('completed_at')
        ->orderByDesc('id')])
    ->latest('id')
    ->get(['id', 'property_name']));

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

Route::post('/inspections/{inspection}/findings', [InspectionController::class, 'addFinding'])->whereNumber('inspection');
Route::patch('/inspections/{inspection}/complete', [InspectionController::class, 'complete'])->whereNumber('inspection');
Route::get('/inspections/{inspection}/report', [InspectionController::class, 'report'])->whereNumber('inspection');
Route::get('/findings/{finding}/photo', [InspectionController::class, 'photo'])->whereNumber('finding');

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
