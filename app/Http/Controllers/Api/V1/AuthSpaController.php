<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Traits\RateLimit;

class AuthSpaController extends Controller{
  use RateLimit;

  /**
   * Login with session-based
   */
  public function login(LoginRequest $req){
    $this->limitRequest($req, 'login-spa');

    $remember = $req->filled('remember'); // $req->boolean('remember');

    if(Auth::attempt($req->only('email', 'password'), $remember)){
      $user = $req->user();
      $user->roles = [
        'key' => config('roles.keys.' . $user->role),
        'name' => config('roles.names.' . $user->role)
      ];

      $expiresAt = $remember ? now()->addWeeks(4) : now()->addHours(2);

      // ✅ Create token
      $token = $user->createToken(
        $req->type, // Token name: spa | native
        ['*'],      // Token abilities: *
        $expiresAt  // Token expiration: 4 weeks | 2 hours
      );

      // $tokenModel = PersonalAccessToken::findToken($token) ?? $user->tokens()->latest()->first();
      $tokenModel = $token->accessToken; // The PersonalAccessToken model instance

      $tokenModel->ip_address = $req->ip();
      $tokenModel->user_agent = $req->userAgent();
      $tokenModel->save();

      $req->session()->regenerate();

      // if($req->type === 'spa' && $req->hasSession()){
      //   $req->session()->regenerate();
      // }

      return jsonSuccess([
        'user' => $user,
        'token' => $token->plainTextToken,
        'expiresAt' => $expiresAt,
        // 'viaRemember' => Auth::viaRemember(),
        // 'remember_works' => $req->session()->get('auth.via_remember'),
        // 'session' => session()->all(),
      ]);
    }

    return jsonError(__('auth.failed'), 401);
    // return back()->withErrors([
    //   'email' => 'The provided credentials do not match our records.',
    // ])->onlyInput('email');
  }

  /**
   * Invalidate session (for SPA clients)
   */
  public function logout(Request $req){
    $user = $req->user();

    if($user){
      $token = $user->currentAccessToken();
      if($token instanceof PersonalAccessToken){
        $token->delete();
      }

      // if($req->hasSession()){
        
      // }

      Auth::guard('web')->logout(); // Auth::logout();
      $req->session()->invalidate();
      $req->session()->regenerateToken();
      return jsonSuccess(1);
    }

    return jsonError(__('auth.failed'), 401);
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
      // $deletes = $user->tokens()->delete();
      Auth::logoutOtherDevices($req->password); // $req->input('password')

      return jsonSuccess(1, __("logoutDevice"));
    }

    return jsonError(__('auth.password'), 422);
  }

  /**
   * List all active sessions and tokens for the authenticated user.
   * This provides the data for your "Active Devices" list on the frontend.
   *
   * @param  \Illuminate\Http\Request  $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function listDevices(Request $request){
    $userId = Auth::id();
    $currentSessionId = $request->session()->getId();

    $devices = [];

    $sessions = DB::table('sessions')
                  ->where('user_id', $userId)
                  ->where('id', '!=', $currentSessionId)
                  ->orderBy('last_activity', 'desc')
                  ->get();

    foreach($sessions as $sess){
      $devices[] = [
        'type' => 'session',
        'id' => $sess->id, // This is the session_id
        'ip_address' => $sess->ip_address,
        'user_agent' => $sess->user_agent,
        'last_activity' => Carbon::createFromTimestamp($sess->last_activity)->diffForHumans(),
        // 'is_current' => ($sess->id === $currentSessionId),
      ];
    }

    $currentAccessTokenId = Auth::user()->currentAccessToken()?->id;

    // --- 2. Get Token-Based Devices (Sanctum Personal Access Tokens) ---
    // Assuming you create a token upon web login for tracking
    $tokens = Auth::user()->tokens()
                  ->where('id', '!=', $currentAccessTokenId)
                  ->orderBy('created_at', 'desc') // created_at | last_used_at
                  ->get();

    foreach($tokens as $token){
      $devices[] = [
        'type' => 'token',
        'id' => $token->id,
        'name' => $token->name, // The name you gave the token (e.g., 'spa')
        'ip_address' => $token->ip_address,
        'user_agent' => $token->user_agent,
        'last_activity' => $token->last_used_at ? $token->last_used_at->diffForHumans() : 'Never',
        'created_at' => $token->created_at, // ->diffForHumans(),
      ];
    }

    return jsonSuccess($devices);
  }

  /**
   * Log out all other sessions and revoke all other tokens for the current user.
   * Requires current password confirmation for security.
   *
   * @param  \Illuminate\Http\Request  $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function logoutAllOtherDevices(Request $request){
    $request->validate([
      'password' => ['required', 'current_password'],
    ], [
      'password.current_password' => __('The provided password does not match your current password.'),
    ]);

    // --- 2. Logout Other Sessions (Session-based) ---
    // This updates the user's password hash in the DB, invalidating other sessions.
    // It keeps the *current* web session active.
    Auth::logoutOtherDevices($request->input('password'));
    // \Log::info('User ' . Auth::id() . ' successfully triggered logout of other web sessions.');

    // --- 3. Revoke Other Tokens (Sanctum Token-based) ---
    // Get the current user's current access token ID (the one they are using now)
    $currentAccessTokenId = Auth::user()->currentAccessToken()?->id;

    if($currentAccessTokenId){
      // Revoke all tokens for this user EXCEPT the current one
      Auth::user()->tokens()->where('id', '!=', $currentAccessTokenId)->delete();
      // \Log::info('User ' . Auth::id() . ' successfully revoked other personal access tokens.');
    }
    // else {
    //   \Log::info('User ' . Auth::id() . ' has no current access token to exclude from revocation.');
    // }

    return jsonSuccess(1, 'Successfully logged out all other sessions and revoked all other tokens.');
  }

  /**
   * Log out or revoke a specific session or token for the authenticated user.
   * Requires current password confirmation for security.
   *
   * @param  \Illuminate\Http\Request  $request
   * @param  string  $type  'session' or 'token'
   * @param  string  $id    The session_id or token_id to terminate/revoke
   * @return \Illuminate\Http\JsonResponse
   */
  public function logoutSpecificDevice(Request $request, string $type, string $id){
    $request->validate([
      'password' => ['required', 'current_password'],
    ], [
      'password.current_password' => __('The provided password does not match your current password.'),
    ]);

    $userId = Auth::id();
    
    if($type === 'session'){
      $currentSessionId = $request->session()->getId();
      // --- Terminate Specific Session ---
      if($id === $currentSessionId){
        return jsonError('Cannot terminate the current active web session. Please use standard logout.');
      }

      $session = DB::table('sessions')
                    ->where('id', $id)
                    ->where('user_id', $userId) // Security check: must belong to current user
                    ->first();

      if(!$session){
        return jsonError('Session not found or does not belong to the current user.', 404);
      }

      Session::getHandler()->destroy($id); // Destroy the actual session
      DB::table('sessions')->where('id', $id)->delete(); // Remove from DB for clean list
      // \Log::info('User ' . $userId . ' terminated specific session: ' . $id);

      return jsonSuccess(1, 'Specific web session terminated successfully.');
    }
    elseif($type === 'token'){
      $currentAccessTokenId = Auth::user()->currentAccessToken()?->id;
    
      // --- Revoke Specific Token ---
      // Ensure the ID is a valid integer for token IDs
      $tokenId = (int) $id;

      if($tokenId === $currentAccessTokenId){
        return jsonError('Cannot revoke the current active token. This would log you out immediately.');
      }

      $token = Auth::user()->tokens()->find($tokenId);

      if(!$token){
        return jsonError('Token not found or does not belong to the current user.', 404);
      }

      $token->delete(); // Revoke the token
      // \Log::info('User ' . $userId . ' revoked specific token: ' . $tokenId);

      return jsonSuccess(1, 'Specific API token revoked successfully.');
    }
    // else{
    //     return response()->json([
    //         'success' => false,
    //         'message' => 'Invalid device type specified. Must be "session" or "token".'
    //     ], 400);
    // }

    return jsonError('Invalid device type specified. Must be "session" or "token".');
  }
}