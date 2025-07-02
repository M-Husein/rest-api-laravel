<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware{
  public function handle(Request $req, Closure $next, string ...$roles): Response{
    $user = $req->user();
    // Check if user is authenticated
    if(!$user){
      return jsonError('Unauthenticated.', 401); // For API, return 401 Unauthorized JSON response
    }

    // Check if the user has any of the required roles
    foreach($roles as $role){
      if($user->hasRole($role)){
        return $next($req);
      }
    }

    // User does not have the required role(s), abort with 403 Forbidden JSON response
    return jsonError('You do not have the required role to access this resource.', 403);
  }
}