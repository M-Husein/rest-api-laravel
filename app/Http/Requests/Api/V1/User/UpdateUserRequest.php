<?php
namespace App\Http\Requests\Api\V1\User;
use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest{
  public function authorize(): bool{
    return true;
  }

  public function rules(): array{
    // Get the user being updated from the route (Route Model Binding)
    // This is crucial for the unique rule to ignore the current user's ID.
    $userId = $this->route('user')->id; // 'user' is the parameter name in Route::apiResource('users', ...)
    return [
      'name' => 'bail|sometimes|required|string|max:100', // 255
      'email' => 'bail|sometimes|required|string|email|max:255|unique:users,email,'.$userId,
      'username' => 'bail|sometimes|string|max:50|unique:users,username,'.$userId,
      'password' => 'bail|sometimes|nullable|string|min:6', // Password is optional and can be null
      // 'role' is the programmatic string expected from the frontend for role updates.
      'role' => 'bail|sometimes|required|integer|in:' . implode(',', array_keys(config('roles.keys')))
    ];
  }

  // protected function prepareForValidation(): void{
  //   // Example: Trim string inputs
  //   $this->merge([
  //     'name' => trim($this->input('name')),
  //     'email' => trim($this->input('email')),
  //     'username' => trim($this->input('username')),
  //   ]);
  // }
}