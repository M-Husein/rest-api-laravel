<?php
// use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\{
  AuthController,
  RegisterController,
  UserController,
  AppTranslationController,
  ArticleController
  // SocialLoginController
};

// const ROLE_ADMIN = 'admin';
// const ROLE_EDITOR = 'editor';
// const ROLE_VIEWER = 'viewer';

Route::prefix('v1')->middleware(['web','hybrid.csrf'])->group(function(){
  Route::post('login', [AuthController::class, 'login']);
  Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
  Route::post('reset-password', [AuthController::class, 'resetPassword']);
  Route::post('register', RegisterController::class);

  // Route::get('/login/{provider}', [SocialLoginController::class, 'redirect']);
  // Route::get('/login/{provider}/callback', [SocialLoginController::class, 'callback']);

  Route::middleware('auth:sanctum')->group(function(){
  // Route::middleware(['web','auth:sanctum','hybrid.csrf'])->group(function(){
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('logout-others', [AuthController::class, 'logoutOthers']);
    Route::delete('logout-device/{id}', [AuthController::class, 'logoutDevice']);
    Route::get('device-logs', [UserController::class, 'listDevices']);
    // /user
    Route::get('me', fn($r) => $r->user());

    // Route::get('users/lazy', [UserController::class, 'lazy']);
    // Route::delete('users/deletes', [UserController::class, 'deletes']);
    // Route::apiResource('users', UserController::class);

    // Admin-only routes
    Route::middleware('role:admin')->group(function(){
      Route::get('users/lazy', [UserController::class, 'lazy']);
      Route::delete('users/deletes', [UserController::class, 'deletes']);
      Route::apiResource('app-translations', AppTranslationController::class);
    });

    Route::apiResource('users', UserController::class);

    // Admin or Editor routes
    Route::middleware('role:admin,editor')->group(function(){
      Route::apiResource('articles', ArticleController::class);
      // Example: Specific action on article that only admin/editor can do
      Route::patch('articles/{article}/publish', [ArticleController::class, 'publish']);
    });

    // Viewer, Editor, or Admin routes (e.g., for viewing articles)
    Route::middleware('role:admin,editor,viewer')->group(function(){
      Route::get('articles', [ArticleController::class, 'index']);
      Route::get('articles/{article}', [ArticleController::class, 'show']);
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
//   return $request->user(); // auth()->user()
// })->middleware('auth:sanctum');

// require __DIR__.'/etc/translation.php';