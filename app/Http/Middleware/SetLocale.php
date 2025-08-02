<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
// use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class SetLocale{
  /**
   * Handle an incoming request.
   * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
   */
  public function handle(Request $req, Closure $next): Response{
    $lang = config('app.locale'); // app.fallback_locale

    if(Auth::check()){
      $lang = Auth::user()->lang ?? $lang;
    }else{
      $locales = config('app.locales');
      $preferred = $req->getPreferredLanguage($locales);

      if(in_array($preferred, $locales)){
        $lang = $preferred;
      }
    }

    if(!app()->isLocale($lang)) app()->setLocale($lang);

    return $next($req);
  }

  // protected function setlang(string $lang){
  //   if(!app()->isLocale($lang)) app()->setLocale($lang);
  // }

  // public function handle(Request $req, Closure $next): Response{
  //   // Check if the user is authenticated
  //   if(Auth::check()){
  //     $userLang = Auth::user()->lang; // auth()->user()?->lang
  //     // If the user has a preferred language, set it
  //     if($userLang){
  //       app()->setLocale($userLang);
  //       return $next($req);
  //     }
  //   }
    
  //   $locales = config('app.locales');
  //   $lang = config('app.fallback_locale');

  //   // $queryLang = $req->query('lang');
  //   // // Option 1: Check for 'lang' query parameter first (highest priority)
  //   // if($queryLang && in_array($queryLang, $locales)){
  //   //   $lang = $queryLang;
  //   // }
  //   // // Option 2: Fallback to Accept-Language header
  //   // else{ // elseif($req->header('Accept-Language')){
  //   //   $preferred = $req->getPreferredLanguage($locales);
  //   //   if($preferred && in_array($preferred, $locales)){
  //   //     $lang = $preferred;
  //   //   }
  //   // }

  //   $preferred = $req->getPreferredLanguage($locales);
  //   if($req->header('Accept-Language') && $preferred && in_array($preferred, $locales)){
  //     $lang = $preferred;
  //   }

  //   if(!app()->isLocale($lang)){
  //     app()->setLocale($lang);
  //   }

  //   return $next($req);
  // }

  /**
   * Option to only support query param lang
   */
  // public function handle(Request $req, Closure $next): Response{
  //   $lang = $req->query('lang');

  //   if(!$lang || !in_array($lang, config('app.locales'))){
  //     $lang = config('app.fallback_locale');
  //   }

  //   if(!app()->isLocale($lang)){
  //     app()->setLocale($lang); // App::setLocale($lang);
  //   }

  //   return $next($req);
  // }
}