<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request; // {Request, Response}
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Spatie\QueryBuilder\AllowedFilter;
use App\Traits\{ApiResponse, HandlesQueryBuilder};

class UserController extends Controller{
  use ApiResponse, HandlesQueryBuilder;

  public function index(Request $req){
    // return $this->handleApiExceptions(function() use ($req){
    //   // return paginate here
    // });

    return $this->paginate(
      query: User::class,
      request: $req,
      searches: ['name'],
      filters: [
        'name',
        AllowedFilter::exact('id'),
        AllowedFilter::scope('email_verified_at')
      ],
      sorts: ['id', 'name', 'email', 'created_at'],
      includes: ['avatar', 'role_id'], // Example = ['category', 'reviews']
    );
  }

  public function lazy(Request $req){
    return $this->simplePaginate(
      query: User::class, // User::query(),
      request: $req,
      searches: ['name'],
      // Optional: filters, sorts, includes like `paginate`
    );
  }

  public function show(string $id){
    $data = User::findOrFail($id);
    return $this->success($data);
  }

  public function store(Request $req){
    $validated = $req->validate([
      'name' => 'bail|required|string|max:100',
      'email' => 'bail|required|email|unique:users,email',
      'username' => 'bail|nullable|string|max:50|unique:users,username',
      'password' => 'bail|required|string|min:6|confirmed'
    ]);

    /**
     * Consider enforcing at least one number/symbol:
     * 'password' => 'bail|required|string|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/'
     * 
     * No XSS sanitization
     * Laravel validation doesn’t sanitize inputs. Use strip_tags or middleware to prevent HTML/JS injection:
     * 'name' => 'bail|required|string|max:100|regex:/^[^\<\>]*$/',
     */

    $validated['password'] = Hash::make($validated['password']);
    
    $user = User::create($validated);
    
    return $this->success(
      $user,
      'User created successfully',
      201 // Response::HTTP_CREATED
    );
  }

  public function update(Request $req, string $id){
    $user = User::findOrFail($id);

    $validated = $req->validate([
      'name' => 'sometimes|string|max:255',
      'email' => 'sometimes|email|unique:users,email,'.$user->id,
      'username' => 'sometimes|string|max:50|unique:users,username,'.$user->username,
      'password' => 'sometimes|string|min:6'
    ]);

    if(isset($validated['password'])){
      $validated['password'] = Hash::make($validated['password']);
    }

    $user->update($validated);
    
    return $this->success($user);
  }

  /**
   * Options: Simple without optional query to hard or soft delete,
   * depends on whether `Illuminate\Database\Eloquent\SoftDeletes` is used in the model.
   */
  // public function destroy(string $id){
  //   $user = User::findOrFail($id);
  //   $user->delete();
  //   return response()->noContent();

  //   // Options: With return data.
  //   // return $this->success(
  //   //   '',
  //   //   '',
  //   //   204 // Consider 200 with data or 404/202 if use case requires it
  //   // );
  // }

  public function destroy(Request $req, string $id){
    $user = User::findOrFail($id);

    if($req->hard ?? false){ // $req->boolean('hard', false)
      $user->forceDelete();
    }else{
      /**
       * Option to ensures
       * Safety – Prevents accidental hard deletes when soft deletes are expected.
       * Clarity – Fails fast with a clear error if the model isn’t configured correctly.
       * The model does not have Illuminate\Database\Eloquent\SoftDeletes
       * Consistency – Makes the API behavior predictable.
       */
      // if(!method_exists($user, 'trashed')){
      //   abort(400, 'Soft delete not supported for this model.');
      // }
      $user->delete();
    }

    return response()->noContent();
  }

  public function deletes(Request $req){
    $validated = $req->validate([
      'ids' => 'required|array',
      'ids.*' => 'exists:users,id',
      'hard' => 'sometimes|boolean'
    ]);

    $q = User::whereIn('id', $validated['ids']);

    if($validated['hard'] ?? false){
      $q->chunkById(200, fn($data) => $data->each->forceDelete());
    }else{
      // Option to ensures like `destroy`
      $q->chunkById(200, fn($data) => $data->each->delete());
    }

    return response()->noContent();
  }
}
