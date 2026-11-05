<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('property_name');
            $table->string('main_image_path', 255)->nullable();
            $table->timestamps();
        });
        Schema::create('inspections', function (Blueprint $table) {
            $table->id();
            $table->string('inspector_name', 255);
            $table->datetime('completed_at')->nullable();
            $table->foreignId('property_id')->constrained();
            $table->timestamps();
        });
        Schema::create('inspection_findings', function (Blueprint $table) {
            $table->id();
            $table->string('item', 255);
            $table->string('status', 20);
            $table->string('severity', 20);
            $table->text('notes')->nullable();
            $table->string('image_path', 255)->nullable();
            $table->foreignId('inspection_id')->constrained();
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('inspection_findings');
        Schema::dropIfExists('inspections');
        Schema::dropIfExists('properties');
    }
};
