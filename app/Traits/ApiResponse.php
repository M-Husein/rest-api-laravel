<?php
namespace App\Traits;
use Illuminate\Http\JsonResponse;

trait ApiResponse{
  /**
   * @param mixed $data
   * @param string $message
   * @param mixed $meta
   * @param int $code
   */
  protected function success(mixed $data = '', string $message = '', mixed $meta = null, int $code = 200): JsonResponse{
    return response()->json([
      'ok' => !0,
      'data' => $data,
      'message' => $message,
      'meta' => $meta
    ], $code);
  }

  /**
   * @param string $message
   * @param int $code
   * @param mixed $errors
   */
  protected function error(string $message, int $code = 400, mixed $errors = null): JsonResponse{
    return response()->json([
      'ok' => !1,
      'errors' => $errors ?? ['code' => $code],
      'message' => $message
    ], $code);
  }

  protected function paginate(mixed $data, string $message = ''){
    return self::success(
      [
        'data' => $data->items(),
        'pagination' => [
          'total' => $data->total(),
          'per_page' => $data->perPage(),
          'current' => $data->currentPage(),
          'last' => $data->lastPage(),
          'links' => [
            'next' => $data->nextPageUrl(),
            'prev' => $data->previousPageUrl()
          ]
        ]
      ],
      $message
    );
  }
}