<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\EmailVerificationController;
// use Illuminate\Http\Request;

Route::prefix('admin')->group(function(){
	Route::get('{uri?}',function(){
		$view = view('admin');
		return response($view)->withHeaders([
			'X-Content-Type-Options' => 'nosniff',
			'X-Frame-Options' => 'SAMEORIGIN',
			'X-XSS-Protection' => '1; mode=block',
			'X-Robots-Tag' => 'none,noarchive'
			// 'X-Powered-By' => 'Programmeria', // Option
			// 'Access-Control-Allow-Origin' => '*',
			// 'Feature-Policy' => "display-capture 'self'"
		]);
	})->where('uri','(.*)');
});

Route::get('/', fn() => view('app'));

Route::middleware('guest')->group(function(){
  Route::get('auth/login', fn() => view('app'))->name('login');
  Route::get('auth/register', fn() => view('app'))->name('register');
});

Route::get('email/verify/{id}/{hash}', [EmailVerificationController::class, 'index'])
  ->middleware('signed')->name('verification.verify');

// All route
Route::get('{uri?}',function(){
	$view = view('app');
	return response($view)->withHeaders([
		'X-Frame-Options' => 'SAMEORIGIN',
		'X-XSS-Protection' => '1; mode=block'
	]);
})->where('uri','(.*)');

// Route::get('/', fn() => view('welcome'));