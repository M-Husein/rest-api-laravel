<?php
namespace App\Models;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;
// use Illuminate\Auth\Notifications\VerifyEmail;
// use Illuminate\Support\Facades\URL;
// use Illuminate\Support\Carbon;
// use Illuminate\Notifications\Messages\MailMessage;

class User extends Authenticatable implements MustVerifyEmail{
	use HasFactory, Notifiable, HasApiTokens, SoftDeletes;

	protected $fillable = [
		'name',
		'email',
		'password',
		'username',
    'avatar',
    'role',
    'lang',
    'theme',
    'provider',
    'provider_id',
    'email_verified_at', // Add if set it in controller
	];

	protected $hidden = [
		'password',
		'remember_token',
    'provider_id', // Often hidden as it's an internal provider ID
    'provider', // Can be hidden if expose it differently
    // Keep 'api_token' if used that instead of Sanctum
	];

  protected $casts = [
    'email_verified_at' => 'datetime',
    'password' => 'hashed',
    'role' => 'integer' // Cast role to integer
  ];

  /**
   * This accessor will be appended to the user JSON response
   */
  protected $appends = [
    'has_password'
  ];

  /**
   * Determines if the user has a traditional password set.
   */
  protected function hasPassword(): Attribute{
    return Attribute::make(
      get: fn() => !is_null($this->password)
    );
  }

  /**
   * Check if the user has a specific role by its programmatic key.
   * @param string $roleKey The programmatic key (e.g., 'admin', 'editor').
   * @return bool
   */
  public function hasRole(string $roleKey): bool{
    // Find the numeric ID associated with the given roleKey from config
    $roleId = array_search($roleKey, config('roles.keys'));
    return $roleId === false ? false : $this->role === $roleId;
  }

  /**
   * Check if the user has any of the given roles by their programmatic keys.
   * @param array $roleKeys An array of programmatic keys (e.g., ['admin', 'editor']).
   * @return bool
   */
  public function hasAnyRole(array $roleKeys): bool{
    $allowedRoleIds = [];
    foreach($roleKeys as $key){
      $id = array_search($key, config('roles.keys'));
      if($id !== false){
        $allowedRoleIds[] = $id;
      }
    }
    return in_array($this->role, $allowedRoleIds);
  }

  /**
   * Override the default email verification notification
   * to use a custom expiration time and API-friendly link.
   */
  // public function sendEmailVerificationNotification(){
  //   $this->notify(new class($this) extends VerifyEmail{
  //     public function toMail($notifiable){
  //       $expiration = config('auth.verification.expire', 60); // minutes

  //       $verificationUrl = URL::temporarySignedRoute(
  //         'verification.verify',
  //         Carbon::now()->addMinutes($expiration),
  //         [
  //           'id' => $notifiable->getKey(),
  //           'hash' => sha1($notifiable->getEmailForVerification())
  //         ]
  //       );

  //       return (new MailMessage)
  //         ->subject('Verify Your Email')
  //         ->line('Click the button below to verify your email address.')
  //         ->action('Verify Email', $verificationUrl)
  //         ->line("This link will expire in {$expiration} minutes.");
  //     }
  //   });
  // }
}