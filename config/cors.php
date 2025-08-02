<?php
return [
  /*
  |--------------------------------------------------------------------------
  | Cross-Origin Resource Sharing (CORS) Configuration
  |--------------------------------------------------------------------------
  | Here you may configure your settings for cross-origin resource sharing
  | or "CORS". This determines what cross-origin operations may execute
  | in web browsers. You are free to adjust these settings as needed.
  |
  | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
  */
  
  'paths' => ['api/*', 'sanctum/csrf-cookie'],
  // 'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'admin/*', 'app/*', 'user/*'],
  
  'allowed_methods' => ['*'],
  // 'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

  // 'allowed_origins' => ['*'],
  'allowed_origins' => [
    'http://localhost:5173', // Your SPA's exact local development origin
    'http://127.0.0.1:5173',
    // 'https://your-spa-domain.com', // Your SPA's exact production origin
  ],

  'allowed_origins_patterns' => [],

  'exposed_headers' => [],

  'allowed_headers' => ['*'],
  // 'allowed_headers' => ['Content-Type', 'Authorization', 'X-XSRF-TOKEN'], // X-XSRF-TOKEN is important for SPA

  'max_age' => 0,
  
  'supports_credentials' => true, // Default false
];