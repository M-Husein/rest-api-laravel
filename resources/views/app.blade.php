@php
$appName = config('app.name', 'Restapi');
$lang = $user?->lang ?? str_replace('_', '-', app()->getLocale());
$ver = config('app.version');
$baseUrl = url('');
# $urlCurrent = url()->current();
@endphp
<!DOCTYPE html>
<html lang="{{ $lang }}" class="{{ $user?->theme }}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#1677ff">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="mobile-web-app-capable" content="yes">
<meta name="format-detection" content="telephone=no,address=no,email=no">
<meta name="robots" content="index,follow">{{-- ,max-image-preview:large --}}

{{-- <link rel="canonical" href="{{ $baseUrl->full() }}"> --}}
{{-- <meta property="og:url" content="{{ $baseUrl->full() }}"/> --}}
{{-- <meta property="og:locale" content="{{ $lang }}"/> --}}

<meta property="og:image" content="{{ $baseUrl }}/logo-144x144.png">
<meta name="twitter:image" content="{{ $baseUrl }}/logo-144x144.png">
<title>{{ $appName }}</title>
<script>
const APP=Object.freeze({
  name:"{{$appName}}",
  version:{{$ver}},
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
<body class="antialiased min-h-fullscreen bg-main">
<div data-nosnippet="true" id="loaderApp" class="load-spin fixed inset-0 cwait">
	<img src="/logo-32x32.png?v={{ $ver }}" alt="" class="fixed inset-0 m-auto" draggable="false"/>
	<b class="spin-border w-16 h-16" role="status" aria-label="Loading"></b>
</div>
<div id="app"></div>
<noscript>
	<style>#loaderApp{display:none}.nojs{font-family:Arial}</style>
	<div data-nosnippet="true" class="fixed inset-0 nojs text-base">
    <b class="text-5xl">⚠️</b>
		<p>{{__('nojs')}}.</p>
		<a class="underline-offset-4 m-auto" rel="noopener noreferrer" target="_blank" href="https://www.enablejavascript.io/{{ $lang }}">{{__('guide')}}</a>
	</div>
</noscript>
</body></html>