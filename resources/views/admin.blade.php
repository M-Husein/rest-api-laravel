@php
$appName = config('app.name', 'Restapi');
$lang = str_replace('_', '-', app()->getLocale());
$ver = config('app.version');
$baseUrl = url('');
@endphp
<!DOCTYPE html>
<html lang="{{ $lang }}">
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
<script src="/js/APP.js?v={{ $ver }}"></script>
@viteReactRefresh
@vite(['resources/css/app.scss','resources/ts/main.tsx'])
</head>
<body class="min-h-screen antialiased admin" data-nosnippet>
<div id="loaderApp" class="load-spin inset-0 cwait">
	<img aria-hidden="true" src="/logo-32x32.png?v={{ $ver }}" alt="{{ $appName }}" class="inset-0 text-0" style="position:fixed;margin:auto"/>
	{{-- <b class="spin-border" style="width:64px;height:64px" role="status"></b> --}}
  <img class="spin-border" width="64" height="64" role="status" aria-hidden="true"/>

  {{-- To use this loader change 'resources/css/app.css' to 'resources/css/app-2.css' --}}
	{{-- <svg role="status" stroke-width="2" viewBox="0 0 32 32" width="87" height="87" fill="none" stroke="#1677ff">
    <circle stroke-width="2" r="12" cx="16" cy="16" fill="none" opacity="0.125"></circle>
    <circle stroke-width="2" r="12" cx="16" cy="16" fill="none" stroke-dasharray="20 110">
      <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 16 16" to="360 16 16" dur="750ms" repeatCount="indefinite"></animateTransform>
    </circle>
	</svg> --}}
</div>
<div id="app"></div>
<noscript>
	<style>#loaderApp{display:none}.nojs{font-family:Arial}</style>
	<div aria-hidden="true" class="inset-0 nojs">
		<p data-nosnippet>You need to enable JavaScript to run this app.</p>
		<a rel="noopener noreferrer nofollow" target="_blank" href="https://www.enablejavascript.io/{{ $lang }}">GUIDE</a>
	</div>
</noscript>
</body></html>