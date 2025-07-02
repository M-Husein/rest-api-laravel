<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\ForgotPasswordRequest;
use App\Http\Requests\Api\V1\Auth\ResetPasswordRequest;
// use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, Hash, Password};
use App\Traits\RateLimit;

class AuthController extends Controller{
  use RateLimit;

  public function login(LoginRequest $req){
    $this->limitRequest($req, 'login');

    if(!Auth::attempt($req->only('email', 'password'))){
      return jsonError('Invalid credentials', 401);
    }

    $user = $req->user(); // Get the authenticated user

    // Optional: delete previous token
    // $user->tokens()->where('user_id', $user->id)->where('name', $req->type)->delete();

    // Token expiration: null for long-living if remember = true
    // else 2 hours default
    $expiresAt = $req->boolean('remember') ? null : now()->addHours(2);

    $token = $user->createToken(
      $req->type ?? 'unknown',
      ['*'], // Optional scopes
      $expiresAt
    )->plainTextToken;

    $tokenModel = $user->tokens()->latest()->first();

    if($tokenModel){
      $tokenModel->user_id = $user->id; // This might be redundant as it's usually set by relation
      $tokenModel->ip_address = $req->ip();
      $tokenModel->user_agent = $req->userAgent();
      // $tokenModel->platform = $req->platform; // $req->input('platform') ?? '';
      $tokenModel->save();
    }

    // Look up the programmatic key and display name using the numeric role ID
    // $roleKey = config('roles.keys.' . $user->role);
    // $roleDisplayName = config('roles.names.' . $user->role);

    return jsonSuccess([
      // ->only('id', 'name', 'email'), // $user->except('password', 'remember_token'),
      'user' => $user,
      'token' => $token,
      'expires_at' => $expiresAt
    ], 'Login successful');
  }

  // 🍪 Stateful login for SPA using Sanctum + Cookies
  // public function loginSession(LoginRequest $req){
  //   if(!Auth::attempt($req->only('email', 'password'))){
  //     return jsonError('Invalid credentials', 401);
  //   }

  //   $user = Auth::user();

  //   return jsonSuccess([
  //     'user' => $user,
  //   ], 'Session login successful');
  // }

  public function logout(Request $req){
    $req->user()->currentAccessToken()->delete();
    // return jsonSuccess('', 'Logged out from this device');
    return response()->noContent();
  }

  public function logoutOthers(Request $req){
    $currentTokenId = $req->user()->currentAccessToken()->id;
    $req->user()->tokens()->where('id', '!=', $currentTokenId)->delete();
    // return jsonSuccess('', 'Logged out from other devices');
    return response()->noContent();
  }

  /**
   * Logout from a specific device using token ID.
   *
   * @param  \Illuminate\Http\Request $request
   * @param  string $id = $deviceId
   * @return \Illuminate\Http\JsonResponse
  */
  public function logoutDevice(Request $req, $id){
    $token = $req->user()->tokens()->where('id', $id)->first();
    if($token){
      $token->delete();
      return jsonSuccess('', 'Logged out from selected device');
    }
    return jsonError('Device not found');
  }

  public function forgotPassword(ForgotPasswordRequest $req){
    $this->limitRequest($req, 'forgot-password');

    $status = Password::sendResetLink($req->only('email'));

    return $status === Password::RESET_LINK_SENT ? jsonSuccess('', 'Reset link sent') : jsonError('Failed to send link');
  }

  public function resetPassword(ResetPasswordRequest $req){
    $status = Password::reset(
      $req->only('email', 'token', 'password', 'password_confirmation'),
      function($user) use ($req){
        $user->update(['password' => Hash::make($req->password)]);
        $user->tokens()->delete();
      }
    );

    return $status === Password::PASSWORD_RESET ? jsonSuccess('', 'Password reset successful') : jsonError('Password reset failed');
  }
}