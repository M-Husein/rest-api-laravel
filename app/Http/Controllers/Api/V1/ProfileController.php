<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
// use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Notification;
use Illuminate\Auth\Notifications\ResetPassword;
use App\Http\Requests\Api\V1\Auth\ChangePasswordRequest;
use App\Traits\RateLimit;

class ProfileController extends Controller{
  use RateLimit;

  public function me(Request $req){
    $user = $req->user(); // auth()->user();
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

  /**
   * Request a password set link to be sent to the user's email.
   * This is for users who do not have a password set (e.g., social login).
   */
  public function requestPasswordSetLink(Request $req){
    $user = $req->user();

    // if(!$user){
    //   return jsonError('Unauthorized', 401);
    // }
    
    // Prevent users who already have a password from using this flow
    if(is_null($user->password)){
      // Delete any existing tokens for this user
      DB::table('password_reset_tokens')->where('email', $user->email)->delete();

      // Generate a new token
      $token = Str::random(60);
      DB::table('password_reset_tokens')->insert([
        'email' => $user->email,
        'token' => Hash::make($token),
        'created_at' => now()
      ]);

      // Send the password set link to the user's email
      Notification::send($user, new ResetPassword($token));

      return jsonSuccess(1, __("passwords.sent"));
    }

    return jsonError('You already have a password set. Please use the change password flow.', 403);
  }

  /**
   * Set a new password using a token from the email link.
   */
  // public function setPassword(Request $req){
  //   $req->validate([
  //     'token' => 'bail|required|string',
  //     'email' => 'bail|required|email|exists:users,email',
  //     'password' => 'bail|required|string|min:6|confirmed'
  //   ]);

  //   $user = User::where('email', $req->email)->first();
  //   $tokenByEmail = $user ? DB::table('password_reset_tokens')->where('email', $req->email) : null;
  //   $tokenData = $tokenByEmail?->first();

  //   if($tokenData && Hash::check($req->token, $tokenData->token) && !now()->diffInMinutes($tokenData->created_at) <= config('auth.passwords.users.expire')){
  //     $user->password = Hash::make($req->password);
  //     $user->save();
  //     $tokenByEmail->delete();

  //     return jsonSuccess(1, 'Password has been set successfully.');
  //   }

  //   return jsonError('This password set token is invalid or has expired.');
  // }

  /**
   * Simple implemetation without token and request link
   */
  // public function setPassword(Request $req){
  //   $user = $req->user();

  //   $req->validate([
  //     'password' => 'bail|required|string|min:6|confirmed' // ['required', 'confirmed', Password::defaults()]
  //   ]);
    
  //   // This check ensures a user cannot set a password if their email isn't verified
  //   if($user->hasVerifiedEmail()){
  //     $user->password = Hash::make($req->password);
  //     $user->save();

  //     return jsonSuccess(1, 'Password set successfully. You can now log in with your email and password.');
  //   }

  //   return jsonError('Please verify your email address before setting a password.', 403);
  // }
}