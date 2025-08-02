<?php
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use App\Http\Middleware\{SetLocale, Role};

return Application::configure(basePath: dirname(__DIR__))
  ->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',
    commands: __DIR__.'/../routes/console.php',
    health: '/up',
  )
  ->withMiddleware(function(Middleware $middleware): void{
    $middleware->web(append: [
      SetLocale::class,
      // \Illuminate\Session\Middleware\AuthenticateSession::class,
    ]);

    $middleware->api(prepend: [
      SetLocale::class,
      \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class // Keep this if your React SPA uses Sanctum's session-based authentication
    ]);

    // Middleware aliases (for use in routes)
    $middleware->alias([
      'role' => Role::class
    ]);

    // $middleware->redirectUsersTo(function(Request $request){
    //   return $request->user()->isAdmin() ? '/admin' : '/';
    // });
  })
  ->withExceptions(function(Exceptions $exceptions): void{
    \App\Exceptions\HandlesException::handle($exceptions);
  })
  ->withCommands([
    \App\Console\Commands\CheckPsr4Autoloading::class
  ])
  ->create();