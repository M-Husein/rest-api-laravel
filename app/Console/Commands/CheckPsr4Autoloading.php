<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;

class CheckPsr4Autoloading extends Command{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'check:psr4-autoloading';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Command description';

  /**
   * Execute the console command.
   */
  public function handle(){
    $this->info('Scanning PSR-4 autoloading paths...');

    $baseNamespace = 'App\\';
    $basePath = app_path();

    $rii = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($basePath));
    $errors = [];

    foreach ($rii as $file) {
      if ($file->isDir() || $file->getExtension() !== 'php') {
        continue;
      }

      $relativePath = str_replace($basePath . '\\', '', $file->getPathname());
      $relativePath = str_replace(['/', '\\'], '\\', $relativePath);
      $expectedClass = $baseNamespace . str_replace('\\', '\\', substr($relativePath, 0, -4));

      // Extract declared class
      $contents = file_get_contents($file->getPathname());
      $matches = [];
      if (preg_match('/namespace\s+(.+);.*?class\s+(\w+)/s', $contents, $matches)) {
        $actualClass = $matches[1] . '\\' . $matches[2];

        if ($expectedClass !== $actualClass) {
          $errors[] = [
            'file' => $file->getPathname(),
            'declared' => $actualClass,
            'expected' => $expectedClass,
          ];
        }
      }
    }

    if (empty($errors)) {
      $this->info('✅ All classes comply with PSR-4 autoloading.');
    } else {
      $this->warn("⚠️ Found " . count($errors) . " mismatch(es):");
      foreach ($errors as $error) {
        $this->line("- File: {$error['file']}");
        $this->line("  Declared: {$error['declared']}");
        $this->line("  Expected: {$error['expected']}");
      }
    }

    return 0;
  }
}
