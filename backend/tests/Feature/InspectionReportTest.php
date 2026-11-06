<?php

namespace Tests\Feature;

use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class InspectionReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_completed_inspection_reports_only_its_saved_findings_in_severity_order(): void
    {
        Storage::fake('public');

        $property = new Property();
        $property->property_name = 'Flat 4';
        $property->save();

        $inspection = ['inspector_name' => 'Sam', 'property_id' => $property->id];
        $id = $this->postJson('/api/inspections', $inspection)->assertCreated()->json('id');
        $otherId = $this->postJson('/api/inspections', $inspection)->assertCreated()->json('id');

        $finding = ['item' => 'Hall light', 'status' => 'good', 'severity' => 'low'];
        $this->postJson("/api/inspections/$otherId/findings", $finding)->assertCreated();
        $this->postJson("/api/inspections/$id/findings", [...$finding, 'status' => 'unknown'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('status');
        $this->postJson("/api/inspections/$id/findings", $finding)->assertCreated();

        $photo = UploadedFile::fake()->image('door.jpg');
        $door = $this->withHeader('Accept', 'application/json')->post("/api/inspections/$id/findings", [
            'item' => 'Front door',
            'status' => 'broken',
            'severity' => 'top',
            'notes' => 'Lock does not secure.',
            'image' => $photo,
        ])->assertCreated()->json();
        Storage::disk('public')->assertExists($door['image_path']);
        $this->get("/api/findings/{$door['id']}/photo")->assertOk()->assertStreamed();

        $this->getJson("/api/inspections/$id/report")->assertConflict();
        $this->patchJson("/api/inspections/$id/complete")->assertNoContent();
        $this->postJson("/api/inspections/$id/findings", $finding)->assertConflict();

        $report = $this->getJson("/api/inspections/$id/report")
            ->assertOk()
            ->assertJsonPath('property_name', 'Flat 4')
            ->assertJsonPath('inspector_name', 'Sam')
            ->assertJsonPath('total', 2)
            ->assertJsonPath('status_counts.broken', 1)
            ->assertJsonPath('status_counts.good', 1)
            ->assertJsonPath('findings.0.item', 'Front door')
            ->assertJsonPath('findings.0.notes', 'Lock does not secure.')
            ->assertJsonPath('findings.1.item', 'Hall light');

        $newProperty = $this->postJson('/api/properties', ['property_name' => 'Flat 5'])
            ->assertCreated()
            ->json('id');
        $this->getJson('/api/properties/overview')
            ->assertOk()
            ->assertJsonCount(2)
            ->assertJsonPath('0.id', $newProperty)
            ->assertJsonCount(0, '0.inspections')
            ->assertJsonPath('1.id', $property->id)
            ->assertJsonCount(1, '1.inspections')
            ->assertJsonPath('1.inspections.0.id', $id)
            ->assertJsonPath('1.inspections.0.inspector_name', 'Sam');

        $this->travel(1)->minute();
        $this->patchJson("/api/inspections/$id/complete")->assertNoContent();
        $this->getJson("/api/inspections/$id/report")
            ->assertJsonPath('completed_at', $report->json('completed_at'));
    }
}
