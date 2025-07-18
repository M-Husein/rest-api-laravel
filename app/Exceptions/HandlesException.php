<?php
namespace App\Exceptions;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\{AccessDeniedHttpException,NotFoundHttpException};
use Spatie\Permission\Exceptions\UnauthorizedException;
use Spatie\QueryBuilder\Exceptions\InvalidQuery;
use App\Exceptions\BaseAppException;

class HandlesException{
  public static function handle($exceptions): void{
    $exceptions->render(function(Throwable $e, Request $req){
      // Optional: log unexpected exceptions
      // \Log::error($e); // 'Caught: ' . get_class($e)

      if($req->is('api/*') || $req->wantsJson()){
        return self::handleApiExceptions($e); //  ?? null
      }

      // @DEV : to debug, comment code above
      // dd(get_class($e), $e->getMessage());

      return null; // Let Laravel handle non-API exceptions (default)
    });
  }

  private static function handleApiExceptions(Throwable $e){
    // ✅ 1. Handle validation early and exit
    // Let Laravel handle validation errors with its default format
    if($e instanceof ValidationException){
      return null;
    }

    // ✅ 2. Handle custom app exceptions
    if($e instanceof BaseAppException){
      return jsonError($e->getMessage(), $e->getCode(), $e->getErrors());
    }

    // ✅ 3. Common REST API errors (rate limit, auth, 404, etc)
    if($e instanceof ThrottleRequestsException){
      return jsonError('Too many requests. Please slow down.', 429);
    }

    if(
      $e instanceof UnauthorizedException ||
      $e instanceof AuthorizationException ||
      $e instanceof AccessDeniedHttpException
    ){
      return jsonError('You are not authorized to perform this action.', 403);
      // 'message' => $e->getMessage(),
      // 'url' => $req->fullUrl() // OPTIONS
    }

    if($e instanceof AuthenticationException){
      // $code = 401; // Response::HTTP_UNAUTHORIZED
      // $e->getMessage() ?? 'Unauthorized' // Default $e->getMessage() = "Unauthenticated."
      return jsonError('Unauthorized.', 401);
    }

    if($e instanceof ModelNotFoundException){
      return jsonError('Resource not found.', 404);
    }

    if($e instanceof NotFoundHttpException){
      return jsonError('Endpoint not found.', 404);
    }

    if($e instanceof InvalidQuery){
      return jsonError('Invalid query parameters.');
    }

    // ✅ 4. Fallback: log and return generic error
    return jsonError('Something went wrong.', 500);
  }
}