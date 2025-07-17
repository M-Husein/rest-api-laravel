<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\{
  AuthController,
  RegisterController,
  EmailVerificationController,
  UserController,
  AppTranslationController,
  ArticleController,
  // SocialLoginController,
  ClearCacheController
};

// const ROLE_ADMIN = 'admin';
// const ROLE_EDITOR = 'editor';
// const ROLE_VIEWER = 'viewer';

// use Illuminate\Support\Facades\URL;
// use Illuminate\Auth\Events\Verified;
// use App\Models\User;

// Route::get('/verify-email/{id}/{hash}', function (Request $request, $id, $hash) {
//     $user = User::findOrFail($id);

//     if (! URL::hasValidSignature($request)) {
//         return response()->json(['message' => 'Invalid or expired verification link.'], 403);
//     }

//     if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
//         return response()->json(['message' => 'Invalid verification hash.'], 403);
//     }

//     if (! $user->hasVerifiedEmail()) {
//         $user->markEmailAsVerified();
//         event(new Verified($user));
//     }

//     return response()->json(['message' => 'Email verified successfully.']);
// })->name('verification.verify');


Route::prefix('v1')->middleware(['web','hybrid.csrf'])->group(function(){
  Route::middleware('guest')->group(function(){
    Route::post('login', [AuthController::class, 'login']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
    Route::post('register', RegisterController::class);
  });

  // Route::get('/login/{provider}', [SocialLoginController::class, 'redirect']);
  // Route::get('/login/{provider}/callback', [SocialLoginController::class, 'callback']);

  Route::middleware('auth:sanctum')->group(function(){
  // Route::middleware(['web','auth:sanctum','hybrid.csrf'])->group(function(){
    // ✅ Verification link callback
    Route::get('email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify']);
      // ->middleware('signed'); // ->name('verification.verify');

    // ✅ Resend verification email
    Route::post('email/verification-notification', [EmailVerificationController::class, 'send'])
      ->middleware('throttle:6,1')->name('verification.send');

    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('logout-others', [AuthController::class, 'logoutOthers']);
    Route::delete('logout-device/{id}', [AuthController::class, 'logoutDevice']);
    Route::get('device-logs', [UserController::class, 'listDevices']);
    // /user
    Route::get('me', function(){
      $user = auth()->user();
      $user->roles = [
        'key' => config('roles.keys.' . $user->role),
        'name' => config('roles.names.' . $user->role)
      ];
      return jsonSuccess($user);
    });

    // Route::get('users/lazy', [UserController::class, 'lazy']);
    // Route::delete('users/deletes', [UserController::class, 'deletes']);
    // Route::apiResource('users', UserController::class);

    // Admin-only routes
    // ['auth:sanctum', 'verified']
    Route::middleware(['role:admin','verified'])->group(function(){
      Route::get('users/lazy', [UserController::class, 'lazy']);
      Route::delete('users/deletes', [UserController::class, 'deletes']);
      Route::apiResource('app-translations', AppTranslationController::class);
      Route::post('clear-cache', ClearCacheController::class);
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

// require __DIR__.'/etc/translation.php';