<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
// use Spatie\Permission\Models\Permission;
// use App\Traits\HandlesQueryBuilder;

class RoleController extends Controller{
  // use HandlesQueryBuilder;

  public function index(){
    $data = Role::withCount('permissions')->get();
    return jsonSuccess($data);
  }

  public function store(Request $request){
    $validated = $request->validate([
      'name' => 'required|string|unique:roles,name',
    ]);

    $data = Role::create(['name' => $validated['name']]);

    return jsonSuccess($data, 'Role created successfully.', 201);
  }

  public function show($id){
    $data = Role::with('permissions')->findOrFail($id);
    return jsonSuccess($data);
  }

  public function update(Request $request, $id){
    $data = Role::findOrFail($id);

    $validated = $request->validate([
      'name' => 'required|string|unique:roles,name,' . $data->id,
    ]);

    $data->name = $validated['name'];
    $data->save();

    // return jsonSuccess($data, 'Role updated successfully.');
    return response()->noContent();
  }

  public function destroy($id){
    $data = Role::findOrFail($id);
    $data->delete();
    return jsonSuccess($data, 'Role deleted successfully.');
  }

  /**
   * Optional: Attach permissions to a role
   */
  public function syncPermissions(Request $request, $id){
    $data = Role::findOrFail($id);

    $validated = $request->validate([
      'permissions' => 'array',
      'permissions.*' => 'exists:permissions,name',
    ]);

    $data->syncPermissions($validated['permissions']);

    return jsonSuccess(
      $data->permissions, // $data
      'Permissions updated successfully.'
    );
  }
}