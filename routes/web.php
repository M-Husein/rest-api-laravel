<?php
use Illuminate\Support\Facades\Route;
// use Illuminate\Support\Facades\Artisan;

Route::prefix('admin')->group(function(){
  // Route::get('clear-cache',function(){
  //   Artisan::call('cache:clear');
  //   return "Cache cleared successfully!";
  // });

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

/**
 * All route
 * @return 
 */
// Route::get('{uri?}',function(){
// 	$view = view('app');
// 	return response($view)->withHeaders([
// 		'X-Frame-Options' => 'SAMEORIGIN',
// 		'X-XSS-Protection' => '1; mode=block'
// 	]);
// })->where('uri','(.*)');

// Route::get('/', fn() => view('welcome'));