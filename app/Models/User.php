<?php
namespace App\Models;
// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable{
	use HasFactory, Notifiable, HasApiTokens, SoftDeletes;

	/**
	 * The attributes that are mass assignable.
	 *
	 * @var list<string>
	 */
	protected $fillable = [
		'name',
		'email',
		'password',
		'username',
    'role'
	];

	/**
	 * The attributes that should be hidden for serialization.
	 *
	 * @var list<string>
	 */
	protected $hidden = [
		'password',
		'remember_token'
	];

	/**
	 * Get the attributes that should be cast.
	 *
	 * @return array<string, string>
	 */
	protected function casts(): array{
		return [
			'email_verified_at' => 'datetime',
			'password' => 'hashed',
      'role' => 'integer' // Cast role to integer
		];
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
    foreach ($roleKeys as $key){
      $id = array_search($key, config('roles.keys'));
      if($id !== false){
        $allowedRoleIds[] = $id;
      }
    }
    return in_array($this->role, $allowedRoleIds);
  }
}