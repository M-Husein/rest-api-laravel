<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration{
  /**
   * Run the migrations.
   */
  public function up(): void{
    Schema::create('users', function(Blueprint $table){
      $table->id();
      $table->string('name');
      $table->string('email')->unique();
      $table->timestamp('email_verified_at')->nullable();

      /**
       * Default Laravel
       */
      // $table->string('password');

      /**
       * Implement social auth can register/login without password, 
       * and can set password later.
       */
      $table->string('password')->nullable();

      $table->string('username')->unique();

      /**
       * User avatar / profile picture
       * Option: ->default('/user.svg') to set default
       */
      $table->string('avatar')->nullable();

      /**
       * Add a string column for the language code
       */
      $table->string('lang', 10)->nullable();

      /**
       * Why 6 ??
       * Just using 'system', 'dark', or 'light'
       * 
       * Why 20 ??
       * 'high-contrast' (15 characters)
       * 'corporate-blue' (15 characters)
       * 'solarized-light' (16 characters)
       */
      $table->string('theme', 6)->default('light');

      /**
       * E.164 standard (recommended for storage)
       * The international ITU-T E.164 standard allows:
       * - Up to 15 digits max
       * - Including country code
       * - No spaces, dashes, or symbols (just + prefix optionally, though not counted in the 15-digit limit)
       * 
       * Example:
       * +14155552671       -> 11 digits (US number)
       * +628123456789012   -> 15 digits (longest in Indonesia)
       */
      $table->string('phone', 16)->nullable();

      /**
       * Add generic columns for social login.
       * provider (provider_name)
       */
      $table->string('provider')->nullable();
      $table->string('provider_id')->nullable();

      /**
       * Added for soft delete support
       */
      $table->softDeletes();

      $table->rememberToken();
      $table->timestamps();

      /**
       * Add a unique constraint for the provider and provider_id combination
       * This ensures a user can only have one social login from a given provider linked this way.
       */
      $table->unique(['provider', 'provider_id']);
    });

    Schema::create('password_reset_tokens', function(Blueprint $table){
      $table->string('email')->primary();
      $table->string('token');
      $table->timestamp('created_at')->nullable();
    });

    Schema::create('sessions', function(Blueprint $table){
      $table->string('id')->primary();
      $table->foreignId('user_id')->nullable()->index();
      $table->string('ip_address', 45)->nullable();
      $table->text('user_agent')->nullable();
      $table->longText('payload');
      $table->integer('last_activity')->index();
    });
  }

  /**
   * Reverse the migrations.
   */
  public function down(): void{
    Schema::dropIfExists('users');
    Schema::dropIfExists('password_reset_tokens');
    Schema::dropIfExists('sessions');
  }
};
