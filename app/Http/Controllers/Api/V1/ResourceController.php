<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Resource;
use Spatie\Permission\Models\Permission;

class ResourceController extends Controller{
  // Default permission actions
  protected array $defaultActions = ['create', 'read', 'update', 'delete', 'menu'];

  /**
   * List all resources with permission count
   */
  public function index(){
    $data = Resource::withCount('permissions')->get();
    return jsonSuccess($data);
  }

  /**
   * Create a resource and generate permissions
   */
  public function store(Request $request){
    $validated = $request->validate([
      'name' => 'required|string|unique:resources,name',
      'label' => 'required|string',
      'group' => 'nullable|string',
      'route' => 'nullable|string',
      'icon' => 'nullable|string',
      'is_menu' => 'boolean'
    ]);

    $data = Resource::create($validated);

    // Auto-generate permissions
    foreach($this->defaultActions as $action){
      $permName = "{$data->name}.{$action}";
      Permission::firstOrCreate(['name' => $permName]);
    }

    return jsonSuccess($data, 'Resource created and permissions generated.', 201);
  }

  /**
   * Show a single resource
   */
  public function show($id){
    $data = Resource::with('permissions')->findOrFail($id);
    return jsonSuccess($data);
  }

  /**
   * Update resource info
   */
  public function update(Request $request, $id){
    $data = Resource::findOrFail($id);

    $validated = $request->validate([
      'name' => 'required|string|unique:resources,name,' . $data->id,
      'label' => 'required|string',
      'group' => 'nullable|string',
      'route' => 'nullable|string',
      'icon' => 'nullable|string',
      'is_menu' => 'boolean'
    ]);

    $data->update($validated);

    return response()->json($data, 'Resource updated successfully.');
  }

  /**
   * Delete a resource and its related permissions
   */
  public function destroy($id){
    $data = Resource::findOrFail($id);

    // Delete related permissions
    foreach($this->defaultActions as $action){
      $permName = "{$data->name}.{$action}";
      Permission::where('name', $permName)->delete();
    }

    $data->delete();

    return response()->noContent();
  }
}