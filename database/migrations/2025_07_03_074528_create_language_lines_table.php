<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration{
  public function up(): void{
    Schema::create('language_lines', function(Blueprint $table){
      $table->id();

      // Translation group (e.g., 'auth', 'validation', 'single')
			$table->string('group', 100);

      // Key of the translation within its group (e.g., 'failed', 'password')
      $table->string('key', 150);

      // Option
      // Language code (ISO 639-1, e.g. 'en', 'id')
			// $table->char('lang', 5); // Compact, indexable, consistent

      /**
       * To check whether this line is user-made (custom) or not (default Laravel/package)
       * By default false for initial installation.
       */
      $table->boolean('is_custom')->default(false);

      // // JSON column to store translations for multiple locales (e.g., {"en": "Hello", "es": "Hola"})
      $table->json('text');

      // Option change to `text()`
			// $table->text('text');

      $table->timestamps();
      // $table->softDeletes(); // Timestamps and soft deletes

      /**
       * Unique Composite Index:
       * Ensures that the combination of 'group' and 'key' is unique.
       * This automatically creates an efficient index for lookups when querying by both 'group' and 'key',
       * which is the most common way translations are retrieved.
       */
      $table->unique(['group', 'key'], 'language_lines_unique');

      // Option
      // $table->unique(['group', 'key', 'lang'], 'language_lines_unique');
    });
  }

  public function down(): void{
    Schema::dropIfExists('language_lines');
  }
};
