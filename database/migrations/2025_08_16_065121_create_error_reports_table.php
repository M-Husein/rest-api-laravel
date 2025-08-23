<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration{
  public function up(): void{
    Schema::create('error_reports', function(Blueprint $table){
      $table->id();

      // Error.name in JS
      $table->string('name', 50)->nullable();

      // React, Vue, Svelte, Angular, ReactNative, Flutter, Android, iOS
      // $table->string('framework', 50);

      // Component / screen
      // $table->text('component');

      // Main human-readable error message
      // Can sometimes be long (stack traces can leak into here)
      $table->string('message', 500)->nullable();
      // 
      // $table->string('message', 1000);
      // $table->text('message');

      // Stack trace
      $table->longText('stack')->nullable(); // $table->text('stack')->nullable();

      // Extra info: device, OS, app version
      $table->json('meta')->nullable();

      // Count duplicates
      $table->unsignedBigInteger('occurrences')->default(1);
      
      // Last time this error occurred
      $table->timestamp('last_occurrence')->nullable();

      // MD5 hash for deduplication
      // md5    -> 32 chars hex
      // sha256 -> 64 chars
      $table->string('hash', 32)->unique();

      $table->timestamps();

      // for deduplication
      $table->unique('hash', 'error_report_hash_unique');
      // $table->unique(['framework', 'component', 'message'], 'frontend_error_unique');
    });
  }

  public function down(): void{
    Schema::dropIfExists('error_reports');
  }
};
