<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration{
  public function up(): void{
    Schema::table('users', function (Blueprint $table) {
      // Get the ID for 'viewer' from the 'keys' mapping for the default value
      // Use array_search to find the ID for 'viewer'
      $viewerId = array_search('viewer', config('roles.keys'));

      $table->unsignedTinyInteger('role') // Use unsignedTinyInteger for roles 0-255
        ->default($viewerId)
        ->after('email');
    });
  }

  public function down(): void{
    Schema::table('users', function (Blueprint $table) {
      $table->dropColumn('role');
    });
  }
};