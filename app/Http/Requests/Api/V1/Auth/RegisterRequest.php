<?php
namespace App\Http\Requests\Api\V1\Auth;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest{
  public function authorize(): bool{
    return true;
  }

  public function rules(): array{
    return [
      'name' => 'bail|required|string|max:100',
      'email' => 'bail|required|email|unique:users,email',
      'username' => 'bail|sometimes|string|max:50|unique:users,username', // Username is optional, but if present, must be unique
      'password' => 'bail|required|string|min:6|confirmed',
      'role' => 'bail|sometimes|integer|in:' . implode(',', array_keys(config('roles.keys'))),
      'type' => 'nullable|string'
    ];
  }

  /**
   * Prepare the data for validation.
   * @return void
   */
  // protected function prepareForValidation(): void{
  //   // Example: Trim string inputs
  //   $this->merge([
  //     'name' => trim($this->input('name')),
  //     'email' => trim($this->input('email')),
  //     'username' => trim($this->input('username')),
  //   ]);
  // }
}