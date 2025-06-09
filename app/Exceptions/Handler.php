<?php
namespace App\Exceptions;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
// use Throwable;
// use Illuminate\Auth\AuthenticationException;

class Handler extends ExceptionHandler{
  protected $levels = [];
  protected $dontReport = [];
  protected $dontFlash = [
    'current_password',
    'password',
    'password_confirmation'
  ];

  public function register(): void{
    $this->reportable(function(){}); // function(Throwable $e)
  }

  // protected function unauthenticated($req, AuthenticationException $e){
  //   if($req->expectsJson()){
  //     return app('router')->myUnauthorizedResponse(); // $e
  //   }
  //   return parent::unauthenticated($req, $e);
  // }
}