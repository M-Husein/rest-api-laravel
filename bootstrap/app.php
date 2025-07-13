<?php
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\{SetLocale, HybridCsrf, Role};

return Application::configure(basePath: dirname(__DIR__))
  ->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
  )
  ->withMiddleware(function(Middleware $middleware): void{
    $middleware->web(append: [
      SetLocale::class
    ]);

    $middleware->api(prepend: [
      \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class, // Keep this if your React SPA uses Sanctum's session-based authentication
      SetLocale::class
    ]);

    // If your React SPA uses Sanctum's session-based authentication (which is common),
    // ensure EnsureFrontendRequestsAreStateful is in the 'web' group (it usually is by default).
    // If your API is purely stateless (e.g., for mobile apps using only tokens),
    // you might remove AuthenticateSession from the 'api' group if it's there.
    // For a typical Laravel + React SPA setup, the default configuration is often fine.

    // Middleware aliases (for use in routes)
    $middleware->alias([
      'role' => Role::class,
      'hybrid.csrf' => HybridCsrf::class
    ]);
  })
  ->withExceptions(function(Exceptions $exceptions): void{
    \App\Exceptions\HandlesException::handle($exceptions);
  })
  ->withCommands([
    \App\Console\Commands\CheckPsr4Autoloading::class
  ])
  ->create();