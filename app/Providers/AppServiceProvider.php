<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
// use Illuminate\Auth\AuthenticationException;
use Illuminate\Routing\Router;

class AppServiceProvider extends ServiceProvider{
    /**
     * Register any application services.
     */
    public function register(): void{}

    /**
     * Bootstrap any application services.
     */
    public function boot(): void{
        Router::macro('customUnauthorizedResponse', fn() => // AuthenticationException $exception
            response()->json([
                'code' => 401,
                'errors' => 'unauthorized'
            ], 401)
        );
        // Apply to all routes
        $this->app->bind(\Illuminate\Contracts\Debug\ExceptionHandler::class, \App\Exceptions\Handler::class);
    }
}
