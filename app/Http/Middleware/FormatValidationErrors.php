<?php
namespace App\Http\Middleware;
use Closure;

class FormatValidationErrors{
  public function handle($req, Closure $next){
    $res = $next($req);

    // Only format JSON responses with 422 status
    if($res->status() === 422 && $req->expectsJson()){
      $ori = $res->getOriginalContent();
      $res->setContent(json_encode([
        'errors' => $ori['errors'] ?? 422,
        'message' => $ori['message'] ?? 'Validation failed'
      ]));
    }

    return $res;
  }
}