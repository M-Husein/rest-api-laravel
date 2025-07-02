<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration{
  public function up(): void{
    Schema::table('users', function (Blueprint $table) {
      // Using string for role, storing the programmatic key (e.g., 'admin')
      $table->string('role')->default(config('roles.viewer'))->after('email');

      // Optional: Using enum for stricter types (Laravel 10+ recommended)
      // $table->enum('role', array_keys(config('roles')))->default(config('roles.viewer'))->after('email');
    });
  }

  public function down(): void{
    Schema::table('users', function (Blueprint $table) {
      $table->dropColumn('role');
    });
  }
};