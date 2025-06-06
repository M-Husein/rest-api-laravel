<?php
namespace App\Http\Requests\Api\V1\Auth;
use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest{
    public function authorize(): bool{
        return true;
    }

    public function rules(): array{
        return [
            'email' => 'bail|required|email',
            'password' => 'bail|required|string|min:6',
            'remember' => 'nullable|boolean'
            // 'device_name' => 'bail|nullable|string|max:100'
        ];
    }

    public function username(): string{
        return 'email';
    }
}