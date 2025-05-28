<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResourcePermission extends Model{
	protected $fillable = [
		'role_id', 'resource',
		'can_create', 'can_read', 'can_update', 'can_delete', 'menu'
	];

	public function role(): BelongsTo{
		return $this->belongsTo(Role::class);
	}
}
