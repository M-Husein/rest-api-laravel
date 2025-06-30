<?php
namespace App\Traits;

use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

trait RateLimit{
  /**
   * @param string $action
   */
  // Option name = limit
  protected function limitRequest(Request $req, string $action){
    $key = Str::lower($action) . '|' . $req->ip();
    if(RateLimiter::tooManyAttempts($key, 5)){
      abort(429, 'Too many requests. Please try again later.');
    }
    RateLimiter::hit($key, 60);
  }
}