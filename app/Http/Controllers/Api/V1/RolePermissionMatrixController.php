<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
// use Spatie\Permission\Models\Permission;
use App\Models\Resource;
use Illuminate\Support\Facades\Gate;

class RolePermissionMatrixController extends Controller{
  /**
   * Default permission actions used across resources
   */
  protected array $defaultActions = ['create', 'read', 'update', 'delete', 'menu'];

  /**
   * Optional: Human-readable action labels
   */
  protected array $actionLabels = [
    'create' => 'Create',
    'read'   => 'View',
    'update' => 'Edit',
    'delete' => 'Delete',
    'menu'   => 'Show in Menu',
  ];

  /**
   * Display permission matrix for a given role.
   */
  public function index($roleId){
    $data = Role::findOrFail($roleId);

    // Authorization check (optional)
    Gate::authorize('manage roles');

    $resources = Resource::all();

    $matrix = [];

    foreach($resources as $resource){
      $permissions = [];

      foreach($this->defaultActions as $action){
        $permName = "{$resource->name}.{$action}";
        $has = $data->hasPermissionTo($permName);

        $permissions[] = [
          'name' => $permName,
          'action' => $action,
          'label' => $this->actionLabels[$action] ?? ucfirst($action),
          'granted' => $has,
        ];
      }

      $matrix[] = [
        'resource_id' => $resource->id,
        'resource_name' => $resource->name,
        'label' => $resource->label,
        'permissions' => $permissions,
      ];
    }

    return jsonSuccess([
      'role' => $data->only(['id', 'name']),
      'matrix' => $matrix,
    ]);
  }

  /**
   * Update permissions for a given role.
   */
  public function update(Request $request, $roleId){
    $data = Role::findOrFail($roleId);

    // Authorization check (optional)
    Gate::authorize('manage roles');

    $validated = $request->validate([
      'permissions'   => ['required', 'array'],
      'permissions.*' => ['string', 'exists:permissions,name'],
    ]);

    $data->syncPermissions($validated['permissions']);

    return jsonSuccess('', 'Role permissions updated successfully.');
  }
}