<?php
namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Illuminate\Auth\AuthenticationException;

class Handler extends ExceptionHandler{
  protected $levels = [];

  protected $dontReport = [];

  protected $dontFlash = [
    'current_password',
    'password',
    'password_confirmation',
  ];

  public function register(): void{
    $this->reportable(function(Throwable $e){
      //
    });
  }

  protected function unauthenticated($request, AuthenticationException $exception){
    if($request->expectsJson()){
      return app('router')->customUnauthorizedResponse($exception);
    }
    return parent::unauthenticated($request, $exception);
  }
}
