<?php
namespace App\Traits;
use Illuminate\Http\JsonResponse;

trait ApiResponse{
  /**
   * @param mixed $data
   * @param string $msg ($message)
   * @param int $code
   */
  protected function success(mixed $data = '', string $msg = '', int $code = 200): JsonResponse{
    return response()->json([
      'data' => $data,
      'message' => $msg
    ], $code);
  }

  /**
   * @param string $msg ($message)
   * @param int $code
   * @param mixed $err ($errors)
   */
  protected function error(string $msg, int $code = 400, mixed $err = null): JsonResponse{
    return response()->json([
      'errors' => $err ?? $code, // $err ?? ['code' => $code]
      'message' => $msg
    ], $code);
  }

  /**
   * @param mixed $data
   * @param string $msg ($message)
   * @return 'Datatables behavior'
   */
  protected function paginate(mixed $data, string $msg = ''){
    return self::success(
      [
        'data' => $data->items(),
        'pagination' => [
          'total' => $data->total(),
          'perPage' => $data->perPage(),
          'page' => $data->currentPage(),
          'last' => $data->lastPage(),
          // 'links' => [
          //   'next' => $data->nextPageUrl(),
          //   'prev' => $data->previousPageUrl()
          // ]
        ]
      ],
      $msg
    );
  }

  /**
   * @param mixed $data
   * @param string $msg ($message)
   * @return 'Infinite scroll behavior'
   */
  protected function lazy(mixed $data, string $msg = ''){
    return self::success(
      [
        'data' => $data->items(),
        'pagination' => [
          'page' => $data->currentPage(),
          'perPage' => $data->perPage(),
          'total' => $data->total(),
          'totalPages' => $data->lastPage(),
          'hasMore' => $data->hasMorePages()
        ]
      ],
      $msg
    );
  }
}