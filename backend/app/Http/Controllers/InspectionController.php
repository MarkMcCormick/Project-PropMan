<?php

namespace App\Http\Controllers;

use App\Models\Inspection;
use App\Models\InspectionFinding;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class InspectionController extends Controller
{
    private const SEVERITIES = ['top', 'high', 'medium', 'low', 'vLow'];

    public function addFinding(Request $request, Inspection $inspection): JsonResponse
    {
        $data = $request->validate([
            'item' => ['required', 'string', 'max:255'],
            'status' => ['required', Rule::in(['good', 'damaged', 'broken'])],
            'severity' => ['required', Rule::in(self::SEVERITIES)],
            'notes' => ['nullable', 'string', 'max:10000'],
            'image' => ['nullable', 'image', 'max:5120'],
        ]);

        $image = $data['image'] ?? null;
        unset($data['image']);
        $path = null;

        try {
            $finding = DB::transaction(function () use ($inspection, $data, $image, &$path) {
                $lockedInspection = Inspection::query()->lockForUpdate()->findOrFail($inspection->id);
                abort_if($lockedInspection->completed_at, 409, 'This inspection is already complete.');

                if ($image) {
                    $path = $image->store('findings', 'public');
                    abort_if($path === false, 500, 'Could not save the finding photo.');
                    $data['image_path'] = $path;
                }

                return $lockedInspection->findings()->create($data);
            });
        } catch (Throwable $error) {
            if ($path) {
                Storage::disk('public')->delete($path);
            }

            throw $error;
        }

        return response()->json($finding, 201);
    }

    public function complete(Inspection $inspection): Response
    {
        DB::transaction(function () use ($inspection) {
            $lockedInspection = Inspection::query()->lockForUpdate()->findOrFail($inspection->id);

            if ($lockedInspection->completed_at === null) {
                $lockedInspection->completed_at = now();
                $lockedInspection->save();
            }
        });

        return response()->noContent();
    }

    public function report(Inspection $inspection): JsonResponse
    {
        abort_if($inspection->completed_at === null, 409, 'Complete the inspection to view its report.');

        $severityOrder = array_flip(self::SEVERITIES);
        $findings = $inspection->findings()->orderBy('id')->get()
            ->sortBy(fn (InspectionFinding $finding) => $severityOrder[$finding->severity] ?? PHP_INT_MAX)
            ->values();

        return response()->json([
            'property_name' => $inspection->property->property_name,
            'inspector_name' => $inspection->inspector_name,
            'completed_at' => $inspection->completed_at,
            'total' => $findings->count(),
            'status_counts' => (object) $findings->countBy('status')->all(),
            'findings' => $findings,
        ]);
    }

    public function photo(InspectionFinding $finding): StreamedResponse
    {
        $disk = Storage::disk('public');
        abort_unless($finding->image_path && $disk->exists($finding->image_path), 404);

        return $disk->response($finding->image_path);
    }
}
