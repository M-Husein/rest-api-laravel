<?php
namespace App\Http\Requests\Api\V1;
use Illuminate\Foundation\Http\FormRequest;

class StoreErrorReportRequest extends FormRequest{
  public function authorize(): bool{
    return true;
  }

  public function rules(): array{
    return [
      // 'framework' => 'bail|required|string', // |in:React,Vue,Svelte,Angular,ReactNative,Flutter,Android,iOS
      'name' => 'bail|required|string',
      'message' => 'bail|required|string',
      'stack' => 'nullable|string',
      'meta' => 'nullable|array'
    ];
  }
}
