<?php
namespace App\Providers;
use Illuminate\Support\ServiceProvider;
// use Illuminate\Support\Facades\Response;
// use Illuminate\Cache\RateLimiting\Limit;
// use Illuminate\Support\Facades\RateLimiter;

class AppServiceProvider extends ServiceProvider{
  /**
   * Register any application services.
   */
  public function register(): void{
    // $this->app->extend('translator', function($translator, $app){
    //   $translator->addLoader('mixed', new MixedLoader(
    //     $app['translation.loader'],
    //     $app['translation-manager']
    //   ));
    //   return $translator;
    // });

    // $this->app->bind('translation.loader', function($app){
    //   return new \App\Services\HybridTranslationLoader(
    //     $app['files'],
    //     $app['path.lang']
    //   );
    // });
  }

  /**
   * Bootstrap any application services.
   */
  public function boot(): void{
    /** @DEV : Define a Rate Limiter (Options) */
    // RateLimiter::for('api', function(Request $request){
    //   return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
    // });

    // Performance Optimization
    // Response::macro('cachedJson', fn($data, $key, $minutes = 15) => 
    //   cache()->remember($key, $minutes * 60, fn() => 
    //     response()->json($data)->withHeaders([
    //       'ETag' => md5(json_encode($data)),
    //       'Cache-Control' => 'public, max-age=' . ($minutes * 60),
    //     ])
    //   )
    // );

    /**
     * With Default json_encode()
     * {
     *    "id": 1,
     *    "name": "\u062d\u0633\u064a\u0646",
     *    "avatar": "https:\/\/example.com\/avatars\/husein.jpg"
     * }
     * 
     * With JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
     * {
     *    "id": 1,
     *    "name": "حسين",
     *    "avatar": "https://example.com/avatars/husein.jpg"
     * }
     */
    // Response::macro('prettyJson', function($data, $status = 200, array $headers = []){
    //   $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    //   return response($json, $status, array_merge(
    //     ['Content-Type' => 'application/json'],
    //     $headers
    //   ));
    // });
  }
}