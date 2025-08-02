<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\Api\V1\Auth\ChangePasswordRequest;
use App\Traits\RateLimit;

class ProfileController extends Controller{
  use RateLimit;

  public function me(Request $req){
    $user = $req->user(); // auth()->user();
    $user->roles = [
      'key' => config('roles.keys.' . $user->role),
      'name' => config('roles.names.' . $user->role)
    ];
    return jsonSuccess($user);
  }

  /**
   * Change the authenticated user's password.
   * @param  \App\Http\Requests\Api\V1\Auth\ChangePasswordRequest $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function changePassword(ChangePasswordRequest $request){
    $this->limitRequest($request, 'change-password');

    $user = $request->user();

    // Use forceFill to bypass mass assignment protection for a single field
    $user->forceFill([
      'password' => Hash::make($request->password)
    ])->save();

    // To revoke all other tokens for security after a password change
    // if don't want old sessions to remain active.
    // This is optional based on security policy.
    $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();

    return jsonSuccess(1, 'Your password has been changed successfully!');
  }
}