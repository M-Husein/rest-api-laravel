<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Spatie\QueryBuilder\AllowedFilter;
use App\Traits\{ApiResponse, HandlesQueryBuilder};

class UserController extends Controller{
  use ApiResponse, HandlesQueryBuilder;

  public function index(Request $request){
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
  }
}
