<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Role{
  public function handle(Request $req, Closure $next, string ...$roleKeys): Response{
    $user = $req->user();

    if(!$user){
      return jsonError('Unauthenticated.', 401);
    }

    foreach($roleKeys as $roleKey){
      if($user->hasRole($roleKey)){ // User model's hasRole() handles conversion to ID
        return $next($req);
      }
    }

    return jsonError('You do not have the required role to access this resource.', 403);
  }
}