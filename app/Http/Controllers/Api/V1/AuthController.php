<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Requests\Api\V1\Auth\ForgotPasswordRequest;
use App\Http\Requests\Api\V1\Auth\ResetPasswordRequest;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller{
  use ApiResponse;

  public function register(RegisterRequest $req){
    $this->checkRateLimit($req, 'register');

    $user = User::create([
      'name' => $req->name,
      'email' => $req->email,
      'username' => $req->username ?? $req->email,
      'password' => bcrypt($req->password)
    ]);

    return $this->success($user, 'Registered successfully', 201);
  }

  public function login(LoginRequest $req){
    $this->checkRateLimit($req, 'login');

    $user = User::where('email', $req->email)->first();

    if(!$user || !Hash::check($req->password, $user->password)){
      return $this->error('Invalid credentials', 401);
    }

    // Optional: delete previous token
    // $user->tokens()->where('user_id', $user->id)->where('name', $req->type)->delete();

    // Token expiration: null for long-living if remember = true
    // else 2 hours default
    $expiresAt = $req->boolean('remember') ? null : now()->addHours(2);

    $token = $user->createToken(
        $req->type ?? 'unknown', // $req->device_name ?? 'unknown',
        ['*'], // Optional scopes
        $expiresAt
    )->plainTextToken;

    $tokenModel = $user->tokens()->latest()->first();
    $tokenModel->user_id = $user->id;
    $tokenModel->ip_address = $req->ip();
    $tokenModel->user_agent = $req->userAgent();
    // $tokenModel->platform = $req->platform; // $req->input('platform') ?? '';
    $tokenModel->save();

    return $this->success([
      'user' => $user, // ->only('id', 'name', 'email'), // $user->except('password', 'remember_token'),
      'token' => $token,
      'expires_at' => $expiresAt
    ], 'Login successful');
  }

  // 🍪 Stateful login for SPA using Sanctum + Cookies
  // public function loginSession(LoginRequest $req){
  //   if(!Auth::attempt($req->only('email', 'password'))){
  //     return $this->error('Invalid credentials', 401);
  //   }

  //   $user = Auth::user();

  //   return $this->success([
  //     'user' => $user,
  //   ], 'Session login successful');
  // }

  public function logout(Request $req){
    $req->user()->currentAccessToken()->delete();
    return $this->success('', 'Logged out from this device');
  }

  public function logoutOthers(Request $req){
    $currentTokenId = $req->user()->currentAccessToken()->id;
    $req->user()->tokens()->where('id', '!=', $currentTokenId)->delete();
    return $this->success('', 'Logged out from other devices');
  }

  /**
   * Logout from a specific device using token ID.
   *
   * @param  \Illuminate\Http\Request $request
   * @param  string  $deviceId
   * @return \Illuminate\Http\JsonResponse
  */
  public function logoutDevice(Request $req, $deviceId){
    $token = $req->user()->tokens()->where('id', $deviceId)->first();
    if($token){
      $token->delete();
      return $this->success('', 'Logged out from selected device');
    }
    return $this->error('Device not found');
  }

  public function listDevices(Request $req){
    $tokens = $req->user()->tokens->map(fn($item) => [
      'id' => $item->id,
      'name' => $item->name,
      // 'abilities' => $item->abilities,
      'user_id' => $item->user_id,
      // 'platform' => $item->platform,
      'ip_address' => $item->ip_address,
      'user_agent' => $item->user_agent,
      'created_at' => $item->created_at, // $item->created_at->toDateTimeString()
      'last_used_at' => $item->last_used_at, // optional($item->last_used_at)->toDateTimeString()
      'expires_at' => $item->expires_at
    ]);
    return $this->success($tokens);
  }

  public function forgotPassword(ForgotPasswordRequest $req){
    $this->checkRateLimit($req, 'forgot-password');

    $status = Password::sendResetLink($req->only('email'));

    return $status === Password::RESET_LINK_SENT ? $this->success('', 'Reset link sent') : $this->error('Failed to send link');
  }

  public function resetPassword(ResetPasswordRequest $req){
    $status = Password::reset(
      $req->only('email', 'token', 'password', 'password_confirmation'),
      function($user) use ($req){
        $user->update(['password' => bcrypt($req->password)]);
        $user->tokens()->delete();
      }
    );

    return $status === Password::PASSWORD_RESET ? $this->success('', 'Password reset successful') : $this->error('Password reset failed');
  }

  protected function checkRateLimit(Request $req, string $action){
    $key = Str::lower($action) . '|' . $req->ip();
    if(RateLimiter::tooManyAttempts($key, 5)){
      abort(429, 'Too many requests. Please try again later.');
    }
    RateLimiter::hit($key, 60);
  }
}