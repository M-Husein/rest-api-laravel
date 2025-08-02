<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use App\Models\User;
use App\Traits\RateLimit; // QueryTools

class UserTokensController extends Controller{
  use RateLimit;

  /**
   * Get a list of all unique users who currently have active Personal Access Tokens,
   * excluding the currently authenticated admin user themselves.
   * Only accessible by users with the 'admin' role.
   *
   * Expected Route: GET /api/v1/admin/user-tokens (no request parameters)
   *
   * @param  \Illuminate\Http\Request  $req
   * @return \Illuminate\Http\JsonResponse
   */
  public function index(Request $req){
    // $this->limitRequest($req, 'admin-list-active-users');

    $user = $req->user();

    if($user && $user->hasRole('admin')){
      $perPage = min(max(1, (int)$req->query('perPage', 10)), 100); // Default 15, max 100
      $page = max(1, (int)$req->query('page', 1)); // Default page 1

      $activeUsers = User::query()
        ->where('id', '!=', $user->id) // Exclude the admin user themselves
        ->whereHas('tokens') // Filter to only include users who have at least one Personal Access Token
        // ->orderBy('created_at', 'desc')
        ->select('id', 'name', 'username', 'email', 'avatar', 'role', 'created_at')
        ->paginate($perPage, ['*'], 'page', $page);

      return response()->json(
        data: $activeUsers,
        options: JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
      );
    }

    return jsonError('Unauthorized', 403);
  }

  /**
   * Get all Personal Access Tokens for a specific user by their ID.
   * Only accessible by users with the 'admin' role.
   *
   * Expected Route: GET /api/v1/admin/users/{user}/tokens
   * (where {user} will be automatically resolved to a User model instance via Route Model Binding)
   *
   * @param  \Illuminate\Http\Request  $req The current request instance.
   * @param  \App\Models\User  $user The target user whose tokens are to be displayed.
   * Laravel automatically injects the User model based on the {user} route parameter.
   * @return \Illuminate\Http\JsonResponse
   */
  public function show(Request $req, User $user){
    // $this->limitRequest($req, 'admin-show-user-tokens');

    $adminUser = $req->user();

    if($adminUser && $adminUser->hasRole('admin')){
      $tokens = $user->tokens()
        ->select('id','name','expires_at','user_agent','ip_address')
        ->get();
      return jsonSuccess($tokens);
    }
    return jsonError('Unauthorized', 403); // Unauthorized: Only Admin can view specific user tokens.
  }

  /**
   * Revokes a specific Personal Access Token for a given user.
   * Only accessible by users with the 'admin' role.
   *
   * Expected Route: DELETE /api/v1/admin/users/{user}/tokens/{tokenId}
   *
   * @param  \Illuminate\Http\Request  $req The current request instance.
   * @param  \App\Models\User  $user The target user whose token is to be revoked (via Route Model Binding).
   * @param  string  $tokenId The ID of the specific token to revoke.
   * @return \Illuminate\Http\JsonResponse
   */
  public function destroy(Request $req, User $user, $tokenId){
    // $this->limitRequest($req, 'admin-revoke-specific-token');

    $adminUser = $req->user();

    if($adminUser && $adminUser->hasRole('admin')){
      $token = $user->tokens()->find($tokenId);

      if($token){
        if($adminUser->id === $user->id && $adminUser->currentAccessToken()->id === $token->id){
          return jsonError('Admins cannot revoke their currently active token via this endpoint. Use /logout for self-revocation.', 403);
        }
        $token->delete();
        return jsonSuccess(null, "Token ID {$tokenId} successfully revoked for user ID {$user->id} ({$user->name}).");
      }
      return jsonError('Token not found for the specified user or token ID is invalid.', 404);
    }
    return jsonError('Unauthorized', 403); // Unauthorized: Only Admin can revoke specific tokens.
  }

  /**
   * Revokes all Personal Access Tokens for a specified user ID.
   * Only accessible by users with the 'admin' role.
   *
   * Expected Payload: { "user_id": 123 }
   *
   * @param  \Illuminate\Http\Request  $req
   * @return \Illuminate\Http\JsonResponse
   * @throws \Illuminate\Validation\ValidationException If input validation fails.
   */
  public function revokes(Request $req){
    $this->limitRequest($req, 'revoke-tokens');

    $user = $req->user();

    if($user && $user->hasRole('admin')){
      $validated = $req->validate(['user_id' => 'bail|required|exists:users,id']);
      $userToRevoke = $validated['user_id'];

      if($userToRevoke == $user->id){
        return jsonError('Admins cannot revoke their own tokens via this endpoint. Please use personal logout methods.', 403);
      }

      $deletes = PersonalAccessToken::where('tokenable_id', $userToRevoke)->delete();

      return jsonSuccess(
        $deletes,
        "Successfully revoked {$deletes} tokens for user ID {$userToRevoke}."
      );
    }

    return jsonError('Unauthorized', 403); // Unauthorized: Only Admin can revoke tokens.
  }
}