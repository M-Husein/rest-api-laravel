<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, Storage, Http};
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;
use App\Traits\ParseUsername;

class SocialAuthController extends Controller{
  use ParseUsername;

  /**
   * Redirect the user to the provider's authentication page.
   * @param  string  $provider
   * @return \Illuminate\Http\RedirectResponse
   */
  public function redirectToProvider(string $provider){
    if(in_array($provider, array_keys(config('services')))){
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
		if(in_array($provider, array_keys(config('services')))){
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
						$generatedUsername = $this->generateUsername($userEmail);
						$user = User::create([
							'name' => $socialiteUser->getName(),
							'email' => $userEmail,
							'username' => $generatedUsername,
							'provider' => $provider,
							'provider_id' => $userId,
							'lang' => config('app.locale'),
							'email_verified_at' => now(),
              'password' => null
						]);
						// \Log::info("New user {$user->id} registered via {$provider} with username: {$generatedUsername}");
					}
				}

        $userAvatar = $socialiteUser->getAvatar();
				// \Log::info('Raw Avatar URL from Socialite: '.($userAvatar ?? 'NULL_AVATAR_FROM_SOCIALITE'));

				// --- START: AVATAR DOWNLOAD AND STORE LOGIC ---
				if($userAvatar && $user && $user->id){ // Ensure user and user ID exist
					try {
						$response = Http::get($userAvatar);
						if($response->successful()){
							$contentType = $response->header('Content-Type');
							$ext = 'jpg';
							if(str_contains($contentType, 'png')){
								$ext = 'png';
							}elseif(str_contains($contentType, 'gif')){
								$ext = 'gif';
							}

							// Generate filename using user ID & uuid
							$filePath = 'avatars/u_'.$user->id.'-'.Str::uuid().'.'.$ext;

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
				// --- END: AVATAR DOWNLOAD AND STORE LOGIC ---

				// Ensure the user is logged in
				Auth::login($user, true);

        // Session-based
        if($req->hasSession()){
				  $req->session()->regenerate();
        }

        // Token-based
        $expiresAt = now()->addYear()->addMonth(); // 1 year 1 month
				$token = $user->createToken(
					'social-auth-'.$provider,
					['*'],
					$expiresAt
				);

        $tokenModel = $token->accessToken; // The PersonalAccessToken model instance
        $tokenModel->ip_address = $req->ip();
        $tokenModel->user_agent = $req->userAgent();
        $tokenModel->save();

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
}