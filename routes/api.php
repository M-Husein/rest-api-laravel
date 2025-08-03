<?php
// use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\{
  AuthController,
  RegisterController,
  EmailVerificationController,
  UserController,
  ProfileController,
  AppTranslationController,
  ClearCacheController,
  UserTokensController,
  ArticleController
};

// const ROLE_ADMIN = 'admin';
// const ROLE_EDITOR = 'editor';
// const ROLE_VIEWER = 'viewer';

Route::prefix('v'.config('app.version'))->group(function(){
  Route::middleware('guest')->group(function(){
    Route::post('login', [AuthController::class, 'login']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
    Route::post('register', RegisterController::class);
  });

  // Route::get('/login/{provider}', [SocialLoginController::class, 'redirect']);
  // Route::get('/login/{provider}/callback', [SocialLoginController::class, 'callback']);

  Route::middleware('auth:sanctum')->group(function(){
    // Resend verification email
    Route::post('verification/{type}', [EmailVerificationController::class, 'send'])
      ->middleware('throttle:6,1')
      ->name('verification.send');

    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('logout-others', [AuthController::class, 'logoutOthers'])
      ->middleware('throttle:6,1');

    Route::get('active-devices', [AuthController::class, 'getActiveDevices']);
    Route::delete('logout-device/{id}', [AuthController::class, 'logoutDevice']);

    // user
    Route::get('me', [ProfileController::class, 'me']);
    Route::put('profile/change-password', [ProfileController::class, 'changePassword']);

    // Route::get('users/lazy', [UserController::class, 'lazy']);
    // Route::delete('users/deletes', [UserController::class, 'deletes']);
    // Route::apiResource('users', UserController::class);

    // Admin-only routes
    // ['auth:sanctum', 'verified']
    Route::middleware(['role:admin','verified'])->group(function(){
      Route::get('users/lazy', [UserController::class, 'lazy']);
      Route::delete('users/deletes', [UserController::class, 'deletes']);

      Route::delete('app-translations/deletes', [AppTranslationController::class, 'deletes']);
      Route::apiResource('app-translations', AppTranslationController::class);

      Route::post('clear-cache', ClearCacheController::class);

      Route::get('user-tokens', [UserTokensController::class, 'index']);
      Route::get('user-tokens/{user}', [UserTokensController::class, 'show']);
      Route::delete('user-tokens/{user}/{tokenId}', [UserTokensController::class, 'destroy']);
      Route::post('revoke-tokens', [UserTokensController::class, 'revokes']);
    });

    Route::put('users/language', [UserController::class, 'language']);
    Route::put('users/theme', [UserController::class, 'theme']);
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

// require __DIR__.'/etc/translation.php';