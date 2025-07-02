<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Traits\RateLimit;
// use Illuminate\Validation\ValidationException;

class RegisterController extends Controller{
  use RateLimit;
  
  public function __invoke(RegisterRequest $req){
    $this->limitRequest($req, 'register');

    // Validation is now handled by RegisterRequest, get the validated data
    $validated = $req->validated();

    // It's validated by the Form Request's 'in' rule.
    // If 'role' is not provided (and it's 'sometimes' in the request), default to 'viewer'.
    $validated['role'] = $validated['role'] ?? array_search('viewer', config('roles.keys'));

    // If username is not provided, use email as username
    if(!isset($validated['username']) || empty($validated['username'])){
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

    $user = User::create($validated);

    // // --- Token Generation (Similar to AuthController's login) ---
    // // For registration, typically a long-living token is issued, or you can make it configurable.
    // // Let's default to no expiration for registration tokens, or adjust as needed.
    // $expiresAt = null; // Or now()->addYears(1) for a long-living token

    // $token = $user->createToken(
    //   $request->type ?? 'registration_token', // Use a meaningful token name
    //   ['*'], // Optional scopes
    //   $expiresAt
    // )->plainTextToken;

    // // Store token metadata (your existing logic from AuthController)
    // $tokenModel = $user->tokens()->latest()->first();
    // if ($tokenModel) {
    //   $tokenModel->user_id = $user->id; // This might be redundant as it's usually set by relation
    //   $tokenModel->ip_address = $req->ip();
    //   $tokenModel->user_agent = $req->userAgent();
    //   // $tokenModel->platform = $req->platform; // $req->input('platform') ?? '';
    //   $tokenModel->save();
    // }
    // // --- End Token Generation ---

    // Prepare the response user object, including derived 'role_key' and 'role_display_name'
    // $roleKey = config('roles.keys.' . $user->role);
    // $roleDisplayName = config('roles.names.' . $user->role);

    return jsonSuccess($user, 'Registered successfully', 201);
  }
}