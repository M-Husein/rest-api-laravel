<?php
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Exceptions\HandlesException;
use App\Http\Middleware\RoleMiddleware;

return Application::configure(basePath: dirname(__DIR__))
  ->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
  )
  ->withMiddleware(function(Middleware $middleware): void{
    // Global middleware (applies to all requests)
    // $middleware->web(append: [
    //  // ... other web middleware
    // ]);

    // Middleware aliases (for use in routes)
    $middleware->alias([
      'role' => RoleMiddleware::class, // Register your custom RoleMiddleware here
      // 'auth' is already aliased by Laravel by default to Illuminate\Auth\Middleware\Authenticate
      // 'auth.sanctum' is also aliased by default to Laravel\Sanctum\Http\Middleware\AuthenticateSanctum
    ]);

    // Middleware groups (like 'api' and 'web')
    // $middleware->api(prepend: [
    //   // \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class, // Keep this if your React SPA uses Sanctum's session-based authentication
    // ]);

    // If your React SPA uses Sanctum's session-based authentication (which is common),
    // ensure EnsureFrontendRequestsAreStateful is in the 'web' group (it usually is by default).
    // If your API is purely stateless (e.g., for mobile apps using only tokens),
    // you might remove AuthenticateSession from the 'api' group if it's there.
    // For a typical Laravel + React SPA setup, the default configuration is often fine.
  })
  ->withExceptions(function(Exceptions $exceptions): void{
    HandlesException::handle($exceptions);
  })->create();