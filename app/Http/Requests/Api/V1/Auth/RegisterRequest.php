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
            'username' => 'bail|string|max:50|unique:users,username',
            'password' => 'bail|required|string|min:6|confirmed'
        ];
    }
}