<?php
namespace App\Models;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;

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
    'email_verified_at' // Add if set it in controller
	];

	protected $hidden = [
		'password',
		'remember_token',
    'provider_id', // Often hidden as it's an internal provider ID
    'provider' // Can be hidden if expose it differently
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
    'roles',
    'has_password'
  ];

  /**
   * Get the roles attribute (computed).
   *
   * @return array
   */
  public function getRolesAttribute(){
    return [
      'key'  => config('roles.keys.' . $this->role),
      'name' => config('roles.names.' . $this->role)
    ];
  }

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
}