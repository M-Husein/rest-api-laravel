<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\ForgotPasswordRequest;
use App\Http\Requests\Api\V1\Auth\ResetPasswordRequest;
// use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\{Auth, Hash, Password};
use App\Traits\RateLimit;

class AuthController extends Controller{
  use RateLimit;

  public function login(LoginRequest $req){
    $remember = $req->boolean('remember');

    if(Auth::attempt($req->only('email', 'password'), $remember)){
      $user = $req->user(); // Get the authenticated user
      $expiresAt = $remember ? now()->addWeeks(4) : now()->addHours(2);

      // ✅ Create token
      $token = $user->createToken(
        $req->type.'-token',
        ['*'],
        $expiresAt
      )->plainTextToken;

      $tokenModel = PersonalAccessToken::findToken($token) ?? $user->tokens()->latest()->first();

      if($tokenModel){
        $tokenModel->ip_address = $req->ip();
        $tokenModel->user_agent = $req->userAgent();
        $tokenModel->save();
      }
      
      if($req->type === 'spa' && $req->hasSession() && $req->session()){
        $req->session()->regenerate();
      }

      return jsonSuccess([
        'user' => $user,
        'token' => $token,
        'expiresAt' => $expiresAt // expires_at
      ]);
    }

    return jsonError(__('auth.failed'), 401);
  }

  public function logout(Request $req){
    // ✅ Revoke current token (for token-based clients)
    $req->user()->currentAccessToken()->delete();

    // ✅ Invalidate session (for SPA clients)
    if($req->hasSession()){
      Auth::guard('web')->logout();
      $req->session()->invalidate();
      $req->session()->regenerateToken();
    }

    return response()->noContent();
  }

  public function logoutOthers(Request $req){
    $user = $req->user();
    $token = $user->currentAccessToken();
    if($token){
      $user->tokens()->where('id', '!=', $token->id)->delete();
      return response()->noContent();
    }
    return jsonError("Not Found"); // No active token found
  }

  /**
   * Logout from a specific device using token ID.
   *
   * @param  \Illuminate\Http\Request $request
   * @param  string $id = $deviceId
   * @return \Illuminate\Http\JsonResponse
  */
  public function logoutDevice(Request $req, int|string $id){
    $token = $req->user()->tokens()->where('id', $id)->first();
    if($token){
      $token->delete();
      return jsonSuccess('', 'Logged out from selected device');
    }
    return jsonError(__("Not Found")); // 'Device not found'
  }

  // Revoke All Tokens for a User
  // PersonalAccessToken::where('tokenable_id', $userId)->delete();

  public function forgotPassword(ForgotPasswordRequest $req){
    $this->limitRequest($req, 'forgot-password');

    $status = Password::sendResetLink($req->only('email'));

    return $status === Password::RESET_LINK_SENT 
      ? jsonSuccess('', __("passwords.sent")) 
      : jsonError(__("Expectation Failed"));
  }

  public function resetPassword(ResetPasswordRequest $req){
    $status = Password::reset(
      $req->only('email', 'token', 'password', 'password_confirmation'),
      function($user) use ($req){
        $user->update(['password' => Hash::make($req->password)]);
        $user->tokens()->delete();
      }
    );

    return $status === Password::PASSWORD_RESET 
      ? jsonSuccess('', __("passwords.reset")) 
      : jsonError(__("passwords.token"));
  }
}