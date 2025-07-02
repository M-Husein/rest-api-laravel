<?php
namespace App\Http\Requests\Api\V1\User;
use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest{
  /**
   * Determine if the user is authorized to make this request.
   * This is usually handled by policies or middleware, but Form Requests
   * can also have authorization logic. For simplicity, we'll return true
   * and rely on the controller's policy check.
   * @return bool
   */
  public function authorize(): bool{
    return true; // Authorization handled by UserController's policy check
  }

  /**
   * Get the validation rules that apply to the request.
   * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
   */
  public function rules(): array{
    return [
      'name' => 'bail|required|string|max:100', // 255
      // Email must be unique
      'email' => 'bail|required|string|email|max:255|unique:users,email',
      // 'email' => 'bail|required|email|unique:users,email',
      'username' => 'bail|sometimes|string|max:50|unique:users,username', // Username is optional, but if present, must be unique
      // Password is required, but no 'confirmed' needed for admin creation
      'password' => 'bail|required|string|min:6', // |confirmed
      'role' => 'bail|sometimes|integer|in:' . implode(',', array_keys(config('roles.keys')))
    ];
  }

  /**
   * Prepare the data for validation.
   * This is where you can modify input before validation, e.g., trim strings.
   * @return void
   */
  // protected function prepareForValidation(): void{
  //   // Example: Trim string inputs
  //   $this->merge([
  //     'name' => trim($this->input('name')),
  //     'email' => trim($this->input('email')),
  //     'username' => trim($this->input('username')),
  //   ]);

  //   if(!$this->has('role')){
  //     $this->merge([
  //       'role' => array_search('viewer', config('roles.keys'))
  //     ]);
  //   }
  // }
}