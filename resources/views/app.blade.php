@php
$appName = config('app.name', 'App2U');
$lang = str_replace('_', '-', app()->getLocale());
$ver = config('app.version');
$baseUrl = url('');
$urlCurrent = url()->current();
@endphp
<!DOCTYPE html>
<html lang="{{ $lang }}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#1677ff">
<meta name="mobile-web-app-capable" content="yes">
<meta name="format-detection" content="telephone=no,address=no,email=no">
<meta name="robots" content="index,follow">{{-- ,max-image-preview:large --}}
<link rel="alternate" href="{{ $urlCurrent }}" hreflang="x-default">
<link rel="alternate" href="{{ $urlCurrent }}/?hl=id" hreflang="id">

{{-- <link rel="canonical" href="{{ $baseUrl->full() }}"> --}}
{{-- <meta property="og:url" content="{{ $baseUrl->full() }}"/> --}}
{{-- <meta property="og:locale" content="{{ $lang }}"/> --}}

<meta property="og:image" content="{{ $baseUrl }}/logo-144x144.png">
<meta name="twitter:image" content="{{ $baseUrl }}/logo-144x144.png">
<title>{{ $appName }}</title>
<script src="/js/APP.js?v={{ $ver }}"></script>
@viteReactRefresh
@vite(['resources/css/app.scss','resources/ts/main.tsx'])
</head>
<body class="antialiased">
<div id="app"></div>
<div id="loaderApp" class="load-spin inset-0 cwait">
	<img aria-hidden="true" draggable="false" src="/logo-32x32.png?v={{ $ver }}" alt="{{ $appName }}" class="inset-0" style="position:fixed;margin:auto;font-size:0"/>
	<b class="spinner-border" style="width:64px;height:64px" role="status"></b>

  {{-- To use this loader change 'resources/css/app.css' to 'resources/css/app-2.css' --}}
	{{-- <svg role="status" stroke-width="2" viewBox="0 0 32 32" width="87" height="87" fill="none" stroke="#1677ff">
    <circle stroke-width="2" r="12" cx="16" cy="16" fill="none" opacity="0.125"></circle>
    <circle stroke-width="2" r="12" cx="16" cy="16" fill="none" stroke-dasharray="20 110">
      <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 16 16" to="360 16 16" dur="750ms" repeatCount="indefinite"></animateTransform>
    </circle>
	</svg> --}}
</div>
<noscript>
	<style>#loaderApp{display:none}.nojs{font-family:Arial}</style>
	<div data-nosnippet aria-hidden="true" class="inset-0 nojs">
		<p data-nosnippet>You need to enable JavaScript to run this app.</p>
		<a rel="noopener noreferrer nofollow" target="_blank" href="https://www.enablejavascript.io/{{ $lang }}">GUIDE</a>
	</div>
</noscript>
</body></html>