<?php
namespace App\Traits;
use Illuminate\Http\JsonResponse;

trait ApiResponse{
  /**
   * @param mixed $data
   * @param string $message
   * @param int $code
   */
  protected function success(mixed $data = null, string $message = '', int $code = 200): JsonResponse{
    return response()->json([
      // 'status' => 'success',
      // OR
      // 'ok' => true,
      'code' => $code,
      'data' => $data,
      'message' => $message
    ], $code);
  }

  /**
   * @param int $code
   * @param mixed $errors
   * @param string $message
   */
  protected function error(int $code = 400, mixed $errors = null, string $message = ''): JsonResponse{
    return response()->json([
      // 'status' => 'error',
      // OR
      // 'ok' => false,
      'code' => $code,
      'errors' => $errors,
      'message' => $message
    ], $code);
  }
}
