<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\StoreErrorReportRequest;
use App\Models\ErrorReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ErrorReportController extends Controller{
  public function parseError(mixed $data){
    $meta = $data['meta'] ?? [];
    $hash = md5(
      $data['name'] . '|' .
      $data['message']   . '|' .
      ($meta['url'] ?? '') . '|' .
      ($meta['userId'] ?? '') . '|' .
      ($meta['framework'] ?? '')
    );

    $error = ErrorReport::where('hash', $hash)->first();

    if ($error) {
      $error->increment('occurrences');
      $error->update(['last_occurrence' => now()]); // Carbon::now()
    } else {
      $data['hash'] = $hash;
      $data['last_occurrence'] = now();
      $error = ErrorReport::create($data);
    }
    return $error;
  }

  /**
   * Store a single error
   */
  public function store(StoreErrorReportRequest $req){
    $data = $req->validated();
    $this->parseError($data);
    return response()->noContent();
  }

  /**
   * Bulk store errors
   */
  public function bulkStore(Request $req){
    $errors = $req->all();

    if(is_array($errors)){
      $inserted = [];

      DB::transaction(function() use ($errors, &$inserted){
        foreach($errors as $data){
          $validated = validator($data, [
            'name' => 'bail|required|string',
            'message' => 'bail|required|string',
            'stack' => 'nullable|string',
            'meta' => 'nullable|array'
          ])->validate();

          $inserted[] = $this->parseError($validated);
        }
      });

      return response()->noContent();
      // return jsonSuccess(1); // $inserted
    }

    return jsonError('Invalid payload, expected an array', 422);
  }
}
