<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\EmailVerificationController;
// use Illuminate\Http\Request;

// Route::prefix('admin')->group(function(){
// 	Route::get('{uri?}',function(){
// 		$view = view('admin');
// 		return response($view)->withHeaders([
// 			'X-Content-Type-Options' => 'nosniff',
// 			'X-Frame-Options' => 'SAMEORIGIN',
// 			'X-XSS-Protection' => '1; mode=block',
// 			'X-Robots-Tag' => 'none,noarchive'
// 			// 'X-Powered-By' => 'Programmeria', // Option
// 			// 'Access-Control-Allow-Origin' => '*',
// 			// 'Feature-Policy' => "display-capture 'self'"
// 		]);
// 	})->where('uri','(.*)');
// });

Route::get('app/{uri?}',function(){
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
})->where('uri','(.*)');

// Route::get('/', fn() => view('app'));

Route::middleware('guest')->group(function(){
  Route::get('auth/login', fn() => view('app', ['user' => auth()->user()]))->name('login');
  Route::get('auth/register', fn() => view('app', ['user' => auth()->user()]))->name('register');
});

// This is the route a user clicks from their email.
// It uses signed middleware and redirects to a front-end view.
Route::get('email/verify/{id}/{hash}', [EmailVerificationController::class, 'verifyWeb'])
  ->middleware(['signed', 'throttle:6,1'])
  ->name('verification.verify');

// All route
Route::get('{uri?}',function(){
	$view = view('app', ['user' => auth()->user()]);
	return response($view)->withHeaders([
		'X-Frame-Options' => 'SAMEORIGIN',
		'X-XSS-Protection' => '1; mode=block',
    // 'X-Powered-By' => config('app.name', 'RestApi'), // Option
	]);
})->where('uri','(.*)');

// Route::get('/', fn() => view('welcome'));