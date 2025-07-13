<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Spatie\TranslationLoader\LanguageLine;
use Illuminate\Support\Facades\Cache;

class ImportDefaultTranslationsSeeder extends Seeder{
  /**
   * The total count of translation lines imported or updated.
   * @var int
   */
  protected $importedCount = 0;

  public function run(): void{
    $supportedLocales = config('app.locales', ['en']);
    $translationPaths = config('app.paths'); // Get all configured translation paths from config/app.php

    if(empty($translationPaths)){
      $this->command->error('No translation paths configured in config/app.php. Please check `app.paths` array.');
      return;
    }

    $this->command->info("Starting import of default translations for locales: " . implode(', ', $supportedLocales));
    $this->command->info("Scanning configured translation paths: " . implode(', ', $translationPaths));

    foreach($supportedLocales as $locale){
      $this->processLocale($locale, $translationPaths);
    }

    $this->clearTranslationCache();
    $this->command->info("\nCompleted! Successfully imported/updated {$this->importedCount} translation lines.");
  }

  /**
   * Process all translation files for a specific locale across all base paths.
   */
  protected function processLocale(string $locale, array $paths): void{
    $this->command->info("\n<fg=blue>--- Processing locale: {$locale} ---</>");

    foreach($paths as $basePath){
      $this->command->line("  <fg=cyan>Scanning base path:</> {$basePath}");

      if(!File::exists($basePath) || !File::isDirectory($basePath)){
        $this->command->warn("  <fg=yellow>Base path not found or not a directory:</> {$basePath}. Skipping.");
        continue;
      }

      $this->processJsonFiles($locale, $basePath);
      $this->processPhpFiles($locale, $basePath);
      $this->processVendorFiles($locale, $basePath);
    }
  }

  /**
   * Process root-level JSON translation files (e.g., lang/en.json).
   */
  protected function processJsonFiles(string $locale, string $basePath): void{
    $filePath = "{$basePath}/{$locale}.json";
    if(File::exists($filePath)){
      $this->importJsonTranslations($filePath, 'single', $locale);
    }else{
      $this->command->line("    No root JSON file found at: {$filePath}");
    }
  }

  /**
   * Process PHP group translation files (e.g., lang/en/auth.php).
   */
  protected function processPhpFiles(string $locale, string $basePath): void{
    $phpLocalePath = "{$basePath}/{$locale}";
    if(File::isDirectory($phpLocalePath)){
      $files = collect(File::files($phpLocalePath))->filter(fn($file) => $file->getExtension() === 'php');

      if($files->isEmpty()){
        $this->command->line("    No PHP group files found in: {$phpLocalePath}");
      }

      $files->each(function($file) use ($locale){
        $group = pathinfo($file->getFilename(), PATHINFO_FILENAME);
        $this->importPhpGroupTranslations($file->getPathname(), $group, $locale);
      });
    }else{
      $this->command->line("    PHP locale directory not found: {$phpLocalePath}");
    }
  }

  /**
   * Process vendor PHP translation files (e.g., lang/vendor/package/en/messages.php).
   */
  protected function processVendorFiles(string $locale, string $basePath): void{
    $vendorBasePath = "{$basePath}/vendor";
    if(File::isDirectory($vendorBasePath)){
      $vendorDirs = collect(File::directories($vendorBasePath));

      if($vendorDirs->isEmpty()){
        $this->command->line("    No vendor directories found in: {$vendorBasePath}");
      }

      $vendorDirs->each(function($vendorDir) use ($locale){
        $vendorName = basename($vendorDir);
        $vendorLocalePath = "{$vendorDir}/{$locale}";

        if(File::isDirectory($vendorLocalePath)){
          $files = collect(File::files($vendorLocalePath))->filter(fn($file) => $file->getExtension() === 'php');

          if($files->isEmpty()){
            $this->command->line("      No vendor PHP files found for '{$vendorName}' in {$vendorLocalePath}");
          }

          $files->each(function ($file) use ($vendorName, $locale) {
            $group = pathinfo($file->getFilename(), PATHINFO_FILENAME);
            $this->importPhpGroupTranslations(
              $file->getPathname(),
              "{$vendorName}::{$group}", // Use Laravel's vendor::group convention
              $locale
            );
          });
        }else{
          $this->command->line("      Vendor locale directory not found for '{$vendorName}': {$vendorLocalePath}");
        }
      });
    }else{
      $this->command->line("    Vendor base path not found or not a directory: {$vendorBasePath}");
    }
  }

  /**
   * Imports translations from a JSON language file.
   */
  protected function importJsonTranslations(string $filePath, string $group, string $locale): void{
    try {
      $jsonContent = File::get($filePath);
      $translations = json_decode($jsonContent, true);

      if(json_last_error() === JSON_ERROR_NONE && is_array($translations)){
        $this->importArrayRecursive($group, $translations, $locale);
        $this->command->info("      <fg=green>Imported JSON root</> '{$group}' for {$locale} from {$filePath}");
      }else{
        $this->command->warn("      <fg=red>Skipping malformed JSON file:</> {$filePath} (JSON error: " . json_last_error_msg() . ").");
      }
    } catch (\Throwable $e){
      $this->command->error("      <fg=red>Error processing JSON file</>: {$filePath} - " . $e->getMessage());
    }
  }

  /**
   * Imports translations from a PHP language file.
   */
  protected function importPhpGroupTranslations(string $filePath, string $group, string $locale, string $prefix = ''): void{
    try {
      $translations = require $filePath;
      if(is_array($translations)){
        $this->importArrayRecursive($group, $translations, $locale, $prefix);
        $this->command->info("      <fg=green>Imported PHP group</> '{$group}' for {$locale} from {$filePath}");
      }else{
        $this->command->warn("      <fg=red>Skipping malformed PHP file:</> {$filePath} (not an array).");
      }
    } catch (\Throwable $e){
      $this->command->error("      <fg=red>Error processing PHP file</>: {$filePath} - " . $e->getMessage());
    }
  }

  /**
   * Recursively processes translation arrays and saves to LanguageLine.
   */
  protected function importArrayRecursive(string $group, array $translations, string $locale, string $prefix = ''): void{
    foreach($translations as $key => $value){
      $fullKey = $prefix . $key;

      if(is_array($value)){
        $this->importArrayRecursive($group, $value, $locale, $fullKey . '.');
      }else{
        // Find existing LanguageLine to merge 'text' attribute
        $languageLine = LanguageLine::where('group', $group)->where('key', $fullKey)->first();

        // Get existing 'text' array or initialize as empty if not found
        $text = $languageLine ? ($languageLine->text ?? []) : [];

        // Add or update the translation for the current locale
        $text[$locale] = $value;

        // Create or update the LanguageLine record
        LanguageLine::updateOrCreate(
          [
            'group' => $group,
            'key' => $fullKey,
          ],
          [
            'text' => $text, // Save the merged text array
            // 'is_custom' => false, // KEEP THIS AS FALSE for imported translations
          ]
        );
        $this->importedCount++; // Increment the counter for each imported line
      }
    }
  }

  /**
   * Clears the translation loader's cache.
   */
  protected function clearTranslationCache(): void{
    // Get the cache key from config, fallback to default if not set
    $cacheKey = config('translation-loader.cache_key', 'spatie.translation-loader.translations');

    // Manually forget the specific cache key used by the translation loader
    Cache::forget($cacheKey);
    $this->command->info("\n<fg=yellow>Translation cache cleared</>");
  }
}

// php artisan db:seed --class=ImportDefaultTranslationsSeeder
