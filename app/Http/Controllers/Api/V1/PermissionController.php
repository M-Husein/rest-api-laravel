<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller{
  /**
   * List all permissions
   */
  public function index(){
    $data = Permission::all();
    return jsonSuccess($data);
  }

  /**
   * Create a new permission
   */
  public function store(Request $request){
    $validated = $request->validate([
      'name' => 'required|string|unique:permissions,name',
    ]);

    $data = Permission::create([
      'name' => $validated['name'],
    ]);

    return jsonSuccess($data, 'Permission created successfully.', 201);
  }

  /**
   * Show a single permission
   */
  public function show($id){
    $data = Permission::findOrFail($id);
    return jsonSuccess($data);
  }

  /**
   * Update permission name
   */
  public function update(Request $request, $id){
    $data = Permission::findOrFail($id);

    $validated = $request->validate([
      'name' => 'required|string|unique:permissions,name,' . $data->id,
    ]);

    $data->name = $validated['name'];
    $data->save();

    return jsonSuccess($data, 'Permission updated successfully.');
  }

  /**
   * Delete a permission
   */
  public function destroy($id){
    $data = Permission::findOrFail($id);
    $data->delete();

    return response()->noContent();
  }
}