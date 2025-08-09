<?php
namespace App\Http\Requests\Api\V1\Auth;
use Illuminate\Foundation\Http\FormRequest;

class ResetPasswordRequest extends FormRequest{
  public function authorize(): bool{
    return true;
  }

  public function rules(): array{
    return [
      'token' => 'bail|required|string',
      'email' => 'bail|required|email|exists:users,email',
      'password' => 'bail|required|string|min:6|confirmed'
    ];
  }
}