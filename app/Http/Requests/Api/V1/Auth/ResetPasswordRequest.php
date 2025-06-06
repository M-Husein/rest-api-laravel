<?php
namespace App\Http\Requests\Api\V1\Auth;
use Illuminate\Foundation\Http\FormRequest;

class ResetPasswordRequest extends FormRequest{
    public function authorize(): bool{
        return true;
    }

    public function rules(): array{
        return [
            'email' => 'bail|required|email|exists:users,email',
            'token' => 'required|string',
            'password' => 'bail|required|string|min:6|confirmed',
            'password_confirmation' => 'required'
        ];
    }
}