<?php
namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Spatie\QueryBuilder\AllowedFilter;
use App\Traits\{ApiResponse, HandlesQueryBuilder};

class UserController extends Controller{
  use ApiResponse, HandlesQueryBuilder;

  public function index(Request $req){
    return $this->handleApiExceptions(function() use ($req){
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
    });
  }

  public function lazy(Request $req){
    return $this->handleApiExceptions(function() use ($req){
      return $this->simplePaginate(
        query: User::class, // User::query(),
        request: $req,
        searches: ['name'],
        // filters: [],
        // sorts: [],
        // includes: []
      );
    });
  }

  public function show(string $id){
    return $this->handleApiExceptions(function() use ($id){
      return $this->success(User::findOrFail($id));
    });
  }

  public function store(Request $req){
    return $this->handleApiExceptions(function() use ($req){
      $validated = $req->validate([
        'name' => 'bail|required|string|max:100',
        'email' => 'bail|required|email|unique:users,email',
        'username' => 'bail|string|max:50|unique:users,username',
        'password' => 'bail|required|string|min:6|confirmed'
      ]);

      $validated['password'] = Hash::make($validated['password']);
      
      $user = User::create($validated);
      
      return $this->success(
        $user,
        'User created successfully',
        Response::HTTP_CREATED // 201
      );
    });
  }

  public function update(Request $req, string $id){
    return $this->handleApiExceptions(function() use ($req, $id){
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
    });
  }
}
