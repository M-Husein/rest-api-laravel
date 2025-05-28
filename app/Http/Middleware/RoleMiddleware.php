<?php
namespace App\Http\Middleware;

use Closure;

class RoleMiddleware{
  public function handle($request, Closure $next, $role){
    if(!$request->user() || !$request->user()->hasRole($role)){
      return response()->json(['message' => 'Forbidden'], 403);
    }
    return $next($request);
  }
}
