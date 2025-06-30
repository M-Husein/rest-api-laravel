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
        Schema::create('resources', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();  // e.g., 'account_mapping'
            $table->string('label');           // e.g., 'Account Mapping'
            $table->string('group')->nullable();
            $table->string('route')->nullable();
            $table->string('icon')->nullable();
            $table->boolean('is_menu')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resources');
    }
};
