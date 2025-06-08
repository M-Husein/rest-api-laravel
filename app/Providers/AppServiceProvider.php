<?php
namespace App\Providers;
use Illuminate\Support\ServiceProvider;
// use Illuminate\Auth\AuthenticationException;
use Illuminate\Routing\Router;
// use Illuminate\Support\Facades\Response;
// use Illuminate\Cache\RateLimiting\Limit;
// use Illuminate\Support\Facades\RateLimiter;

class AppServiceProvider extends ServiceProvider{
  /**
   * Register any application services.
   */
  public function register(): void{}

  /**
   * Bootstrap any application services.
   */
  public function boot(): void{
    /** @DEV : Define a Rate Limiter (Option) */
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

    Router::macro('myUnauthorizedResponse', fn() => // fn(AuthenticationException $e)
      response()->json([
        'errors' => 401,
        'message' => 'Unauthorized' // $e->getMessage() ?? 'Unauthorized'
      ], 401)
    );

    // Apply to all routes
    $this->app->bind(
      \Illuminate\Contracts\Debug\ExceptionHandler::class,
      \App\Exceptions\Handler::class
    );
  }
}