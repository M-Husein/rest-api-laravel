<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, Storage, Http};
// use Illuminate\Support\Facades\Hash;
// use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class SocialAuthController extends Controller{
  /**
   * Allowed social providers. Add more as you configure them.
   * @var array
   */
  protected $allowedProviders = ['google']; // , 'facebook', 'github'

  /**
   * Redirect the user to the provider's authentication page.
   * @param  string  $provider
   * @return \Illuminate\Http\RedirectResponse
   */
  public function redirectToProvider(string $provider){
    if(in_array($provider, $this->allowedProviders)){
      return Socialite::driver($provider)
        ->scopes(['openid','email','profile'])
        ->redirect();
    }
    // \Log::warning("Attempted to redirect to unsupported provider: {$provider}");
    return redirect(config('app.frontend_url').'/api/v1/auth/social/callback/'.$provider.'?error=unsupported_provider');
  }

  /**
   * Handle the provider's authentication callback.
   * @param  string  $provider
   * @return \Illuminate\Http\RedirectResponse
   */
	public function handleProviderCallback(Request $req, string $provider){
		if(in_array($provider, $this->allowedProviders)){
			try {
				$socialiteUser = Socialite::driver($provider)->user();
        $userId = $socialiteUser->getId();

				// --- Start: User Fetch/Creation Logic (Existing and New Users) ---
				// This block needs to run first to get the $user object and its ID
				$user = User::where('provider', $provider)
					->where('provider_id', $userId)
					->first();

				if(!$user){
          $userEmail = $socialiteUser->getEmail();
					$user = User::where('email', $userEmail)->first();

					if($user){
						if(is_null($user->provider) || is_null($user->provider_id)){
							// Link existing email to social account
							$user->provider = $provider;
							$user->provider_id = $userId;
							$user->email_verified_at = $user->email_verified_at ?? now();
							$user->save(); // Save to ensure ID is available if user was just created in this request
							// \Log::info("Existing user {$user->id} linked to {$provider} account");
						}
						else{
							// \Log::warning("Email {$userEmail} already linked to another provider or different ID for {$provider}");
							return redirect(config('app.frontend_url').'/api/v1/auth/social/callback/'.$provider.'?error=email_already_linked&provider='.$provider);
						}
					}else{
						// Create new user
						$userName = $socialiteUser->getName();
						$generatedUsername = $this->generateUniqueUsername(
							$socialiteUser->getNickname() ?? 
							$userName ?? 
							explode('@', $userEmail)[0]
						);

						$user = User::create([
							'name' => $userName,
							'email' => $userEmail,
							'username' => $generatedUsername,
							'provider' => $provider,
							'provider_id' => $userId,
							'lang' => config('app.locale'),
							'email_verified_at' => now(),
              'password' => null // for social users
							// 'password' => Hash::make(Str::random(24)),
						]);
						// \Log::info("New user {$user->id} registered via {$provider} with username: {$generatedUsername}");
					}
				}

        $userAvatar = $socialiteUser->getAvatar();
				// \Log::info('Raw Avatar URL from Socialite: '.($userAvatar ?? 'NULL_AVATAR_FROM_SOCIALITE'));

				// --- START: MODIFIED AVATAR DOWNLOAD AND STORE LOGIC ---
				if($userAvatar && $user && $user->id){ // Ensure user and user ID exist
					try {
						$response = Http::get($userAvatar);
						if($response->successful()){
							$contentType = $response->header('Content-Type');
							$extension = 'jpg';
							if(str_contains($contentType, 'png')){
								$extension = 'png';
							}elseif(str_contains($contentType, 'gif')){
								$extension = 'gif';
							}

							// Generate filename using user ID
							$filePath = 'avatars/u_'.$user->id.'-'.Str::uuid().'.'.$extension;

							Storage::disk('public')->put($filePath, $response->body());
							$userAvatar = '/storage/' . $filePath; // Absolute URL = Storage::disk('public')->url($filePath);
							// \Log::info('Avatar successfully downloaded and stored at: '.$userAvatar);

							// Update user's avatar field if it has changed or was null
							if($user->avatar !== $userAvatar){
								$user->avatar = $userAvatar;
								$user->save();
							}
						} 
						// else{
						// 	\Log::warning('Failed to download avatar from '.$rawAvatarUrl.' Status: '.$response->status());
						// }
					}catch(\Exception $e){
						\Log::error('Exception while downloading avatar: '.$e->getMessage());
					}
				}
				// else if($user && $user->id && $rawAvatarUrl === null && $user->avatar === null){
				// 	\Log::info("No raw avatar URL provided for user {$user->id}. Keeping avatar null");
				// }
				// --- END: MODIFIED AVATAR DOWNLOAD AND STORE LOGIC ---

				// Ensure the user is logged in
				Auth::login($user, true);
				request()->session()->regenerate();

        $expiresAt = now()->addWeek();

				$token = $user->createToken(
					'social-auth-'.$provider,
					['*'],
					$expiresAt
				);

        $tokenModel = $token->accessToken; // The PersonalAccessToken model instance
        $tokenModel->ip_address = $req->ip();
        $tokenModel->user_agent = $req->userAgent();
        $tokenModel->save();

        // $user->roles = [
        //   'key' => config('roles.keys.' . $user->role),
        //   'name' => config('roles.names.' . $user->role)
        // ];

				// Redirect to SPA's callback URL with token and user data
        $spaCallbackUrl = config('app.frontend_url').'/auth/social/callback/'.$provider;
        return redirect($spaCallbackUrl.'?token='.$token->plainTextToken.'&user='.json_encode($user).'&provider='.$provider.'&exp='.$expiresAt);
			}
			catch(\Exception $e){
				// \Log::error("Social authentication failed for {$provider}: ".$e->getMessage()." Stack: ".$e->getTraceAsString());
				$spaErrorUrl = config('app.frontend_url').'/auth/social/callback/'.$provider;
				return redirect($spaErrorUrl.'?error=authentication_failed&message='.urlencode($e->getMessage()).'&provider='.$provider);
			}
		}

		return redirect(config('app.frontend_url').'/auth/social/callback/'.$provider.'?error=unsupported_provider');
	}

  /**
   * Generates a unique username based on a base string.
   * @param string $baseString The string to derive the username from (e.g., user's name or email part).
   * @return string A unique username.
   */
  protected function generateUniqueUsername(string $baseString): string{
    // Clean the base string to make it URL-friendly, remove spaces, lowercase
    $baseUsername = Str::slug($baseString, '');
    // Limit length to avoid excessively long usernames
    $username = Str::limit($baseUsername, 20, '');

    // Fallback if the base string is empty or results in an empty slug
    if(empty($username)){
      $username = 'user';
    }

    $originalUsername = $username;
    $i = 0;

    // Check if username already exists, append a number if it does
    while(User::where('username', $username)->exists()){
      $i++;
      $username = $originalUsername.$i;
      if($i > 100){ // Safety break to prevent infinite loops for very common names
        $username = $originalUsername.Str::random(4); // Add random suffix if many attempts
        break;
      }
    }
    return $username;
  }
}