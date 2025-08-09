<?php
namespace App\Http\Requests\Api\V1\Auth;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;

class ChangePasswordRequest extends FormRequest{
  /**
   * Determine if the user is authorized to make this request.
   */
  public function authorize(): bool{
    return auth()->check();
  }

  /**
   * Get the validation rules that apply to the request.
   * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
   */
  public function rules(): array{
    return [
      'current_password' => [
        'bail',
        'required',
        'string',
        function($attribute, $value, $fail){
          // Custom rule to verify current password matches the authenticated user's password
          if(!Hash::check($value, auth()->user()->password)){
            $fail('The ' . $attribute . ' is incorrect.');
          }
        },
      ],
      'password' => [ // This will be the new password
        'bail',
        'required',
        'string',
        'min:6', // Or whatever minimum length you enforce
        'confirmed', // Requires a 'password_confirmation' field
        'different:current_password' // Ensure new password is not the same as old
      ]
    ];
  }

  /**
   * Get the error messages for the defined validation rules.
   * @return array<string, string>
   */
  public function messages(): array{
    return [
      'password.different' => 'The new password must be different from the current password.'
    ];
  }
}