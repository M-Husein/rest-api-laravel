<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use App\Traits\RateLimit;
use App\Models\User;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;

class RegisterController extends Controller{
  use RateLimit;
  
  public function __invoke(RegisterRequest $req){
    $this->limitRequest($req, 'register');

    $user = User::create([
      'name' => $req->name,
      'email' => $req->email,
      'username' => $req->username ?? $req->email,
      'password' => Hash::make($req->password)
    ]);

    return jsonSuccess($user, 'Registered successfully', 201);
  }
}