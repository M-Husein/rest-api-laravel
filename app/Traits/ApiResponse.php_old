<?php
namespace App\Traits;
use Illuminate\Http\JsonResponse;
// use Illuminate\Http\Response;
// use Illuminate\Http\Request;

trait ApiResponse{
  /**
   * @param mixed $data
   * @param string $msg ($message)
   * @param int $code
   */
  protected function success(
    mixed $data = '',
    string $msg = '',
    int $code = 200
  ): JsonResponse{
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
  protected function error(
    string $msg,
    int $code = 400,
    mixed $err = null
  ): JsonResponse{
    return response()->json([
      'errors' => $err ?? $code,
      'message' => $msg
    ], $code);
  }

  /**
   * Wrap controller logic in exception handling
   */
  // protected function handleApiExceptions(callable $callback): JsonResponse{
  //   try {
  //     return $callback();
  //   }
  //   catch (\Exception $e) {
  //     $code = 500;
  //     return self::error(
  //       'Something went wrong',
  //       $code,
  //       config('app.debug') ? 
  //         [
  //           'code' => $e->getCode(),
  //           'trace' => $e->getTrace(),
  //           'message' => $e->getMessage(),
  //           'exception' => get_class($e)
  //         ] 
  //         : 
  //         $code
  //     );
  //   }
  // }
}
