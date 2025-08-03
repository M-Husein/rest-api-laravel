@php
$appName = config('app.name', 'Restapi');
$lang = $user?->lang ?? str_replace('_', '-', app()->getLocale());
$ver = config('app.version');
$baseUrl = url('');
@endphp
<!DOCTYPE html>
<html lang="{{ $lang }}" class="{{ $user?->theme }}" data-nosnippet="true">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#1677ff">
<meta name="mobile-web-app-capable" content="yes">
<meta name="format-detection" content="telephone=no,address=no,email=no">
<meta name="robots" content="none,nosnippet,noarchive,noimageindex">
<meta name="googlebot" content="none,nosnippet,noarchive,noimageindex">
<meta name="AdsBot-Google" content="none,nosnippet,noarchive,noimageindex">
<meta name="googlebot-news" content="none,nosnippet,noarchive,noimageindex">
<meta name="bing" content="none,nosnippet,noarchive,noimageindex">
<meta name="baidu" content="none,nosnippet,noarchive,noimageindex">
<meta property="og:image" content="{{ $baseUrl }}/logo-144x144.png">
<meta name="twitter:image" content="{{ $baseUrl }}/logo-144x144.png">
<title>{{ $appName }}</title>
{{-- <meta name="csrf-token" content="{{ csrf_token() }}"> --}}
<link rel="icon" href="/favicon.ico" sizes="any">
{{-- <link rel="icon" href="/logo.svg" type="image/svg+xml"> --}}
<link rel="apple-touch-icon" href="/logo-180x180.png">
{{-- <link rel="stylesheet" href="/css/Q.css?v={{ $ver }}"> --}}
{{-- <script src="/js/APP.js?v={{ $ver }}"></script> --}}
<script>
const APP=Object.freeze({
  name:"{{$appName}}",
  version:{{ $ver }},
  api:"{{ $baseUrl }}/api/v{{ $ver }}",
  timeout:{{ config('app.timeout') }},
  defaultLang:"{{ config('app.fallback_locale') }}",
  locales:{
    id:"Indonesia",
    en:"English"
  }
});
</script>
@viteReactRefresh
@vite(['resources/css/app.scss','resources/ts/main.tsx'])
</head>
<body data-nosnippet class="antialiased min-h-fullscreen bg-main admin">
<div id="loaderApp" class="load-spin fixed inset-0 cwait">
	<img src="/logo-32x32.png?v={{ $ver }}" alt="" class="fixed inset-0 m-auto" draggable="false"/>
	<b class="spin-border w-16 h-16" role="status" aria-label="Loading"></b>

  {{-- To use this loader change 'resources/css/app.css' to 'resources/css/app-2.css' --}}
	{{-- <svg role="status" aria-label="Loading" stroke-width="2" viewBox="0 0 32 32" width="87" height="87" fill="none" stroke="#1677ff">
    <circle stroke-width="2" r="12" cx="16" cy="16" fill="none" opacity="0.125"></circle>
    <circle stroke-width="2" r="12" cx="16" cy="16" fill="none" stroke-dasharray="20 110">
      <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 16 16" to="360 16 16" dur="750ms" repeatCount="indefinite"></animateTransform>
    </circle>
	</svg> --}}
</div>
<div id="app"></div>
<noscript>
	<style>#loaderApp{display:none}.nojs{font-family:Arial}</style>
	<div class="fixed inset-0 nojs text-base">
    <b class="text-5xl">⚠️</b>
		<p>{{__('nojs')}}.</p>
		<a class="underline-offset-4 m-auto" rel="noopener noreferrer" target="_blank" href="https://www.enablejavascript.io/{{ $lang }}">{{__('guide')}}</a>
	</div>
</noscript>
</body></html>