<?php
// use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\RegisterController;
// use App\Http\Controllers\Api\V1\SocialLoginController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\PermissionController;
use App\Http\Controllers\Api\V1\ResourceController;
use App\Http\Controllers\Api\V1\RolePermissionMatrixController;

Route::prefix('v1')->group(function(){
  Route::post('login', [AuthController::class, 'login']);
  Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
  Route::post('reset-password', [AuthController::class, 'resetPassword']);
  Route::post('register', RegisterController::class);

  // Route::get('/login/{provider}', [SocialLoginController::class, 'redirect']);
  // Route::get('/login/{provider}/callback', [SocialLoginController::class, 'callback']);

  Route::middleware('auth:sanctum')->group(function(){
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('logout-others', [AuthController::class, 'logoutOthers']);
    Route::delete('logout-device/{id}', [AuthController::class, 'logoutDevice']);
    Route::get('devices-log', [AuthController::class, 'listDevices']);
    // /user
    Route::get('me', fn($r) => $r->user());

    Route::get('users/lazy', [UserController::class, 'lazy']);
    Route::delete('users/deletes', [UserController::class, 'deletes']);
    Route::apiResource('users', UserController::class);

    Route::middleware('can:manage roles')->group(function(){
      Route::post('roles/{role}/permissions', [RoleController::class, 'syncPermissions']);
      Route::apiResource('roles', RoleController::class);

      Route::apiResource('permissions', PermissionController::class);

      Route::apiResource('resources', ResourceController::class);

      Route::get('roles/{role}/matrix', [RolePermissionMatrixController::class, 'index']);
      Route::post('roles/{role}/matrix', [RolePermissionMatrixController::class, 'update']);
    });
  });

  /** @Example : Apply the Rate Limiter to API Routes */
  // Route::middleware('throttle:api')->group(function(){
  //   Route::get('posts', function(){
  //     return response()->json(['message' => 'API response']);
  //   });
    
  //   // Other API routes...
  // });
});

// Route::get('user', function(Request $request){
//     return $request->user(); // auth()->user()
// })->middleware('auth:sanctum');