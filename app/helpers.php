<?php
if(!function_exists('jsonSuccess')){
  /**
   * @param mixed $data
   * @param string $msg ($message)
   * @param int $code
   * @return \Illuminate\Http\JsonResponse
   * JSON { "data": array | object | string | number | null, "message": string }
   */
  function jsonSuccess(
    mixed $data = '',
    string $msg = '',
    int $code = 200
  ){
    return response()->json([
      'data' => $data,
      'message' => $msg
    ], $code);
  }
}

if(!function_exists('jsonError')){
  /**
   * @param string $msg ($message)
   * @param int $code
   * @param mixed $err ($errors)
   * @return \Illuminate\Http\JsonResponse
   * JSON { "errors": number | string | array | object | null, "message": string }
   */
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