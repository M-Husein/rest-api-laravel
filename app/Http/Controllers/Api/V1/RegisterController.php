<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Hash; // {Auth, Hash}
// use Laravel\Sanctum\PersonalAccessToken;
use App\Models\User;
use App\Traits\RateLimit;
// use Illuminate\Validation\ValidationException;

class RegisterController extends Controller{
  use RateLimit;
  
  public function __invoke(RegisterRequest $req){
    $this->limitRequest($req, 'register');

    $validated = $req->validated();

    // It's validated by the Form Request's 'in' rule.
    // If 'role' is not provided (and it's 'sometimes' in the request), default to 'viewer'.
    if(empty($validated['role'])){
      $validated['role'] = array_search('viewer', config('roles.keys'));
    }

    // If username is not provided, use email as username
    if(empty($validated['username'])){
      $validated['username'] = $validated['email'];
    }

    /**
     * Consider enforcing at least one number/symbol:
     * 'password' => 'bail|required|string|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/'
     * 
     * No XSS sanitization
     * Laravel validation doesn’t sanitize inputs. Use strip_tags or middleware to prevent HTML/JS injection:
     * 'name' => 'bail|required|string|max:100|regex:/^[^\<\>]*$/',
     */
    $validated['password'] = Hash::make($validated['password']);

    if(empty($validated['lang'])){
      $validated['lang'] = config('app.fallback_locale');
    }

    $user = User::create($validated);

    event(new Registered($user));

    $user->roles = [
      'key' => config('roles.keys.' . $user->role),
      'name' => config('roles.names.' . $user->role)
    ];

    return jsonSuccess($user, 'Registered successfully');

    // // Option auto login
    // // Token Generation (Similar to AuthController's login)
    // // For registration, typically a long-living token is issued, or you can make it configurable.
    // // Let's default to no expiration for registration tokens, or adjust as needed.
    // $expiresAt = now()->addHours(2);

    // // ✅ Create token
    // $token = $user->createToken(
    //   $req->type.'-token',
    //   ['*'],
    //   $expiresAt
    // )->plainTextToken;

    // $tokenModel = PersonalAccessToken::findToken($token) ?? $user->tokens()->latest()->first();

    // if($tokenModel){
    //   $tokenModel->ip_address = $req->ip();
    //   $tokenModel->user_agent = $req->userAgent();
    //   $tokenModel->save();
    // }
    
    // if($req->type === 'spa' && $req->hasSession() && $req->session()){
    //   Auth::login($user);
    //   // $req->session()->regenerate();
    // }
    // // End Token Generation

    // event(new Registered($user));

    // // Prepare the response user object, including derived 'role_key' and 'role_display_name'
    // $user->roles = [
    //   'key' => config('roles.keys.' . $user->role),
    //   'name' => config('roles.names.' . $user->role)
    // ];

    // return jsonSuccess(
    //   [
    //     'user' => $user,
    //     'token' => $token,
    //     'expiresAt' => $expiresAt
    //   ],
    //   'Registered successfully'
    // );
  }
}