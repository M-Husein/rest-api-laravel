<?php
// use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
// use App\Http\Controllers\Api\V1\SocialLoginController;
use App\Http\Controllers\Api\V1\UserController;

Route::prefix('v1')->group(function(){
  Route::post('/register', [AuthController::class, 'register']);
  Route::post('/login', [AuthController::class, 'login']);
  Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
  Route::post('/reset-password', [AuthController::class, 'resetPassword']);

  // Route::get('/login/{provider}', [SocialLoginController::class, 'redirect']);
  // Route::get('/login/{provider}/callback', [SocialLoginController::class, 'callback']);

  Route::middleware('auth:sanctum')->group(function(){
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-others', [AuthController::class, 'logoutOthers']);
    Route::delete('/logout-device/{id}', [AuthController::class, 'logoutDevice']);
    Route::get('/devices-log', [AuthController::class, 'listDevices']);
    // /user
    Route::get('/me', fn($r) => $r->user());

    Route::apiResource('users', UserController::class); // ->except(['destroy'])
  });

  /** @Example : Apply the Rate Limiter to API Routes */
  // Route::middleware('throttle:api')->group(function(){
  //   Route::get('/posts', function(){
  //     return response()->json(['message' => 'API response']);
  //   });
    
  //   // Other API routes...
  // });
});

// Route::get('/user', function(Request $request){
//     return $request->user(); // auth()->user()
// })->middleware('auth:sanctum');