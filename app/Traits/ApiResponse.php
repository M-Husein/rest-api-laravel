<?php
namespace App\Traits;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
// use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
// use Spatie\QueryBuilder\Exceptions\InvalidQuery;

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
  protected function handleApiExceptions(callable $callback): JsonResponse{
    // try {
    //   return $callback();
    // } catch (\Exception $e) {
    //   return $this->apiErrorResponse(
    //     message: 'Something went wrong',
    //     error: config('app.debug') ? $e->getMessage() : null,
    //     code: Response::HTTP_INTERNAL_SERVER_ERROR
    //   );
    // }

    try {
      return $callback();
    }
    // catch (InvalidQuery $e) { // Handle Spatie's invalid query parameters (e.g., invalid ?filter=)
    //   return self::error(
    //     'Invalid query parameters',
    //     400,
    //     $e->getMessage() // ['query' => $e->getMessage()]
    //   );
    // }
    catch (ValidationException $e) {
      return $this->error(
        'Validation errors', // $e->getMessage() ?? 'Validation errors'
        Response::HTTP_UNPROCESSABLE_ENTITY, // 422
        $e->errors()
      );
    }
    catch (\Exception $e) {
      $msg = 'Something went wrong';
      return self::error(
        $msg,
        Response::HTTP_INTERNAL_SERVER_ERROR, // 500
        config('app.debug') ? $e->getMessage() : $msg
      );
    }
  }
}
