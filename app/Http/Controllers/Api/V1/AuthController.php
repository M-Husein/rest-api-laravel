<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Requests\Api\V1\Auth\ForgotPasswordRequest;
use App\Http\Requests\Api\V1\Auth\ResetPasswordRequest;
// use App\Models\DeviceLog;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\RateLimiter;

class AuthController extends Controller{
  use ApiResponse;

  public function register(RegisterRequest $request){
      $this->checkRateLimit($request, 'register');

      $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => bcrypt($request->password),
        // 'password_confirmation' => 
      ]);

      return $this->success($user->only('id', 'name', 'email'), 'Registered successfully', 201);
  }

  public function login(LoginRequest $request){
    $this->checkRateLimit($request, 'login');

    $user = User::where('email', $request->email)->first();

    if(!$user || !Hash::check($request->password, $user->password)){
      return $this->error(401, 'invalid.credentials', 'Invalid credentials');
    }

    if($request->device_name){
      $user->tokens()->where('name', $request->device_name)->delete();
    }

    // Token expiration: null for long-living if remember = true
    $tokenExpiresAt = $request->boolean('remember')
      ? null
      : now()->addHours(2); // e.g. 2 hours default

    $token = $user->createToken(
        $request->device_name ?? 'unknown',
        ['*'], // optional scopes
        $tokenExpiresAt
    )->plainTextToken;

    $tokenModel = $user->tokens()->latest()->first();
    $tokenModel->platform = $request->input('platform') ?? '';
    $tokenModel->ip_address = $request->ip();
    $tokenModel->user_agent = $request->userAgent();
    $tokenModel->save();

    // DeviceLog::create([
    //   'user_id' => $user->id,
    //   'device_name' => $request->device_name,
    //   'ip_address' => $request->ip(),
    //   'user_agent' => $request->userAgent(),
    //   // 'platform' => $request->header('X-Platform', 'unknown'),
    // ]);

    $data = [
      'user' => $user->only('id', 'name', 'email'), // $user
      'token' => $token,
      // 'type' => 'Bearer',
      // 'expires_at' => $tokenExpiresAt,
    ];

    if($tokenExpiresAt){
      $data['expires_at'] = $tokenExpiresAt;
    }

    return $this->success($data, 'Login successful');
  }

  // 🍪 Stateful login for SPA using Sanctum + Cookies
  // public function loginSession(LoginRequest $request){
  //   if(!Auth::attempt($request->only('email', 'password'))){
  //     return $this->error(401, 'invalid.credentials', 'Invalid credentials');
  //   }

  //   $user = Auth::user();

  //   return $this->success([
  //     'user' => $user->only('id', 'name', 'email'),
  //   ], 'Session login successful');
  // }

  public function logout(Request $request){
    $request->user()->currentAccessToken()->delete();
    return $this->success(null, 'Logged out from this device');
  }

  public function logoutOthers(Request $request){
    $currentTokenId = $request->user()->currentAccessToken()->id;
    $request->user()->tokens()->where('id', '!=', $currentTokenId)->delete();
    return $this->success(null, 'Logged out from other devices');
  }

  /**
   * Logout from a specific device using token ID.
   *
   * @param  \Illuminate\Http\Request  $request
   * @param  string  $deviceId
   * @return \Illuminate\Http\JsonResponse
  */
  public function logoutDevice(Request $request, $deviceId){
    $token = $request->user()->tokens()->where('id', $deviceId)->first();

    if(!$token){
      return $this->error(404, 'device.404', 'Device not found');
    }

    $token->delete();

    return $this->success(null, 'Logged out from selected device');
  }

  public function listDevices(Request $request){
    $tokens = $request->user()->tokens->map(fn($token) => [
      'id' => $token->id,
      'name' => $token->name, // 'device_name'
      'platform' => $token->platform,
      'ip_address' => $token->ip_address,
      'user_agent' => $token->user_agent,
      'created_at' => $token->created_at->toDateTimeString(),
      'last_used_at' => optional($token->last_used_at)->toDateTimeString(),
    ]);

    return $this->success($tokens);
  }

  public function forgotPassword(ForgotPasswordRequest $request){
    $this->checkRateLimit($request, 'forgot-password');

    $status = Password::sendResetLink($request->only('email'));

    return $status === Password::RESET_LINK_SENT
      ? $this->success(null, 'Reset link sent')
      : $this->error(400, 'failed', 'Failed to send link');
  }

  public function resetPassword(ResetPasswordRequest $request){
    $status = Password::reset(
      $request->only('email', 'token', 'password', 'password_confirmation'),
      function($user) use ($request){
        $user->update(['password' => bcrypt($request->password)]);
        $user->tokens()->delete();
      }
    );

    return $status === Password::PASSWORD_RESET
      ? $this->success(null, 'Password reset successful')
      : $this->error(400, 'password.reset.failed', 'Reset failed');
  }

  protected function checkRateLimit(Request $request, string $action){
    $key = Str::lower($action) . '|' . $request->ip();

    if(RateLimiter::tooManyAttempts($key, 5)){
      abort(429, 'Too many requests. Please try again later.');
    }

    RateLimiter::hit($key, 60);
  }
}
