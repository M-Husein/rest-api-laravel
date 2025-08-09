<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\ForgotPasswordRequest;
use App\Http\Requests\Api\V1\Auth\ResetPasswordRequest;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\{Auth, Hash, Password};
// use App\Models\User;
use App\Traits\RateLimit;

class AuthController extends Controller{
  use RateLimit;

  /**
   * Login with token-based
   */
  public function login(LoginRequest $req){
    $this->limitRequest($req, 'login');

    // Check if a user with this email exists and has no password set
    // $user = User::where('email', $req->email)->first();

    // if($user && is_null($user->password)){
    //   return jsonError('It looks like you registered with a social account and have not set a password yet. Please use social login or set a password for your account.', 403);
    // }

    $remember = $req->boolean('remember');

    if(Auth::attempt($req->only('email', 'password'), $remember)){
      $user = $req->user(); // Use variable above

      if($req->type === 'spa' && $req->hasSession()){
        $req->session()->regenerate();
      }

      $expiresAt = $remember ? now()->addYear()->addMonth() : now()->addHours(2);

      // ✅ Create token
      $token = $user->createToken(
        $req->type, // Token name: spa | native
        ['*'],      // Token abilities: *
        $expiresAt  // Token expiration: 1 year 1 month | 2 hours
      );

      // $tokenModel = PersonalAccessToken::findToken($token) ?? $user->tokens()->latest()->first();
      $tokenModel = $token->accessToken; // The PersonalAccessToken model instance
      $tokenModel->ip_address = $req->ip();
      $tokenModel->user_agent = $req->userAgent();
      $tokenModel->save();

      return jsonSuccess([
        'user' => $user,
        'token' => $token->plainTextToken,
        'expiresAt' => $expiresAt
      ]);
    }

    return jsonError(__('auth.failed'), 401);
  }

  /**
   * Revoke token if it's a PersonalAccessToken (for token-based clients)
   */
  public function logout(Request $req){
    $user = $req->user();

    if($user){
      // Session-based
      if($req->hasSession()){
        Auth::guard('web')->logout(); // Auth::logout();
        $req->session()->invalidate();
        $req->session()->regenerateToken();
      }

      // Token-based
      $token = $user->currentAccessToken();
      if($token instanceof PersonalAccessToken){
        $token->delete();
      }

      return jsonSuccess(1);
    }

    return jsonError(__('auth.failed'), 401);
  }

  public function getActiveDevices(Request $req){
    $user = $req->user();
    $currenTokenId = $user->currentAccessToken()?->id;

    // Retrieve all personal access tokens issued to the user.
    // Filter out the current token if it was used for authentication.
    $devices = $user->tokens->filter(function($token) use ($currenTokenId){
      return $token->id !== $currenTokenId;
    })->values()->map(fn($item) => [
      'id' => $item->id,
      'name' => $item->name,
      'ip_address' => $item->ip_address,
      'user_agent' => $item->user_agent,
      'created_at' => $item->created_at,
      'last_used_at' => $item->last_used_at,
      'expires_at' => $item->expires_at
    ]);

    return jsonSuccess($devices);

    // Get all persistent API tokens for the user
    // $devices = $user->tokens()->get()->map(function (PersonalAccessToken $token) use ($req) {
    //   $isCurrent = false;
    //   $currentAccessToken = $req->user()->currentAccessToken();

    //   // Determine if this token is the one currently being used for the request
    //   if ($currentAccessToken instanceof PersonalAccessToken && $currentAccessToken->id === $token->id) {
    //     $isCurrent = true;
    //   }

    //   return [
    //     'id' => $token->id,
    //     'name' => $token->name,
    //     'last_used_at' => $token->last_used_at,
    //     'created_at' => $token->created_at,
    //     'expires_at' => $token->expires_at,
    //     'ip_address' => $token->ip_address,
    //     'user_agent' => $token->user_agent,
    //     'is_current' => $isCurrent, // Flag to indicate the current token
    //   ];
    // });
  }

  /**
   * Logs out all other devices for the authenticated user, except the current one.
   * Requires current password for security.
   * Expected Payload: { "email": "user@example.com", "password": "current_password" }
   */
  public function logoutOthers(Request $req){
    $user = $req->user();

    if(Auth::guard('web')->validate([
      'email' => $user->email,
      'password' => $req->password
    ])){
      $deletes = 0;
      $currentToken = $user->currentAccessToken();

      if($currentToken instanceof PersonalAccessToken){
        // 2. Delete all tokens except the current one
        // If currentTokenId is null (e.g., session-authenticated user), it won't exclude anything from personal access tokens
        // For session-authenticated users, logoutOtherDevices() is for other web sessions.
        // This is specifically for other *API tokens*.
        $deletes = $user->tokens()
          ->where('id', '!=', $currentToken->id) // Exclude current token
          ->delete();
      }else{
        $deletes = $user->tokens()->delete();
      }

      return jsonSuccess($deletes, __("logoutDevice"));
    }

    return jsonError(__('auth.password'), 422);
  }

  /**
   * Logs out a specific device (personal access token) for the authenticated user,
   * requiring current password validation for security.
   *
   * Expected Payload: { "email": "user@example.com", "password": "current_password" }
   * Expected Route: DELETE /api/v1/logout-specific-device/{id}
   */
  public function logoutDevice(Request $req, int|string $id){
    $user = $req->user();

    if(Auth::guard('web')->validate([
      'email' => $user->email,
      'password' => $req->password
    ])){
      $token = $user->tokens()->find($id);

      if($token){
        $currentToken = $user->currentAccessToken();
        if($currentToken instanceof PersonalAccessToken && $currentToken->id === $token->id){
          return jsonError(__("You cannot log out the device currently in use for this request. Please use the general logout endpoint."), 403);
        }

        $token->delete();

        return jsonSuccess(1, __("logoutDevice"));
      }

      return jsonError("Device " . __("Not Found"), 404);
    }

    return jsonError(__('auth.password'), 422);
  }

  /**
   * Option: simple version
   * Logout from a specific device using token ID.
   *
   * @param  \Illuminate\Http\Request $request
   * @param  string $id $deviceId
   * @return \Illuminate\Http\JsonResponse
  */
  // public function logoutDevice(Request $req, int|string $id){
  //   $token = $req->user()->tokens()->find($id); // ->where('id', $id)->first()
  //   if($token){
  //     $token->delete();
  //     return jsonSuccess(1, __("logoutDevice"));
  //   }
  //   return jsonError("Device " . __("Not Found"), 404);
  // }

  public function forgotPassword(ForgotPasswordRequest $req){
    $this->limitRequest($req, 'forgot-password');

    $status = Password::sendResetLink($req->only('email'));

    return $status === Password::RESET_LINK_SENT 
      ? jsonSuccess(1, __("passwords.sent")) 
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
      ? jsonSuccess(1, __("passwords.reset")) 
      : jsonError(__("passwords.token"));
  }
}