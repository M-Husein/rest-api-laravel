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

  public function index(Request $request){
    return $this->handleApiExceptions(function() use ($request) {
      return $this->paginate(
        query: User::class,
        request: $request,
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

  public function lazy(Request $request){
    return $this->handleApiExceptions(function() use ($request) {
      return $this->simplePaginate(
        query: User::class, // User::query(),
        request: $request,
        searches: ['name'],
        // filters: [],
        // sorts: [],
        // includes: []
      );
    });
  }

  public function show(string $id){
    return $this->handleApiExceptions(function() use ($id) {
      return $this->success(User::findOrFail($id));
    });
  }

  public function store(Request $req){
    return $this->handleApiExceptions(function() use ($req) {
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
}
