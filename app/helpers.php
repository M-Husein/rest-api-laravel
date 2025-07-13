<?php
if(!function_exists('jsonSuccess')){
  function jsonSuccess(
    mixed $data = '',
    string $msg = '',
    int $code = 200,
    ?array $headers = [],
    ?bool $unescaped = true
  ){
    return response()->json([
      'data' => $data,
      'message' => $msg
    ], $code, $headers, $unescaped ? JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES : 0);
  }
}

if(!function_exists('jsonError')){
  function jsonError(
    string $msg,
    int $code = 400,
    mixed $err = null
  ){
    return response()->json([
      'errors' => $err ?? $code,
      'message' => $msg,
    ], $code);
  }
}

// composer dump-autoload