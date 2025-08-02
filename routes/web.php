<?php
// use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\EmailVerificationController;
use App\Http\Controllers\Api\V1\AuthSpaController;

Route::middleware('guest')->group(function(){
  Route::get('auth/login', fn() => view('app', ['user' => null]))->name('login');
  Route::get('auth/register', fn() => view('app', ['user' => null]))->name('register');
  Route::get('auth/forgot-password', fn() => view('app', ['user' => null]))->name('password.email');
  Route::get('auth/reset-password', fn() => view('app', ['user' => auth()->user()]))->name('password.reset');

  Route::prefix('api/v1')->group(function(){
    Route::post('login-spa', [AuthSpaController::class, 'login']);
  });
});

// No login
// This is the route a user clicks from their email.
// It uses signed middleware and redirects to a front-end view.
Route::get('email/verify/{id}/{hash}', [EmailVerificationController::class, 'verifyWeb'])
  ->middleware(['signed', 'throttle:6,1'])
  ->name('verification.verify');

  // 'auth' | ['auth','auth.session']
Route::middleware(['auth','auth.session'])->group(function(){
  Route::get('app/{any?}',function(){
    $view = view('admin', ['user' => auth()->user()]);
    return response($view)->withHeaders([
      'X-Content-Type-Options' => 'nosniff',
      'X-Frame-Options' => 'SAMEORIGIN',
      'X-XSS-Protection' => '1; mode=block',
      'X-Robots-Tag' => 'none,noarchive',
      // 'X-Powered-By' => config('app.name', 'RestApi'), // Option
      // 'Access-Control-Allow-Origin' => '*',
      // 'Feature-Policy' => "display-capture 'self'"
    ]);
  })->where('any','.*')->name('app');

  Route::prefix('api/v1')->group(function(){
    Route::post('logout-spa', [AuthSpaController::class, 'logout']);
    Route::post('logout-others-spa', [AuthSpaController::class, 'logoutOthers'])
      ->middleware('throttle:6,1');

    Route::get('devices', [AuthSpaController::class, 'listDevices']);
    Route::post('logout-all-other', [AuthSpaController::class, 'logoutAllOtherDevices']);
    Route::delete('devices/{type}/{id}', [AuthSpaController::class, 'logoutSpecificDevice']);
  });
});

Route::get('api/v1/test/test-remember', function(){
  // Manually test remember functionality
  if (auth()->check()) {
    return jsonSuccess([
      'remembered' => auth()->viaRemember(),
      'user' => auth()->user(),
      'session' => session()->all()
    ]);
  }
  return jsonError("Not authenticated");
})->middleware('auth');

// All route
Route::get('/{any}', function(){
  $view = view('app', ['user' => auth()->user()]);
	return response($view)->withHeaders([
		'X-Frame-Options' => 'SAMEORIGIN',
		'X-XSS-Protection' => '1; mode=block',
    // 'X-Powered-By' => config('app.name', 'RestApi'), // Option
	]);
})->where('any', '.*');

// Route::get('/', fn() => view('welcome'));