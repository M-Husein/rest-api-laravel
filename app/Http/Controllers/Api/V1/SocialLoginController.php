<?php
namespace App\Http\Controllers;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Str;
use App\Traits\ApiResponse;

class SocialLoginController extends Controller{
    use ApiResponse;

    public function redirect($provider){
        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function callback($provider){
        $socialUser = Socialite::driver($provider)->stateless()->user();

        $user = User::firstOrCreate([
            'email' => $socialUser->getEmail()
        ], [
            'name' => $socialUser->getName() ?? $socialUser->getNickname(),
            'password' => bcrypt(Str::random(24))
        ]);

        return $this->success([
            'token' => $user->createToken($provider.'_token')->plainTextToken,
            'user' => $user
        ]);
    }
}
