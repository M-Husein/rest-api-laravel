<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
// use Illuminate\Support\Facades\Config; // Import Config

class UserSeeder extends Seeder{
  public function run(): void{
    User::create([
      'name' => 'Admin User',
      'username' => 'SuperAdmin',
      'email' => 'admin@example.com',
      'password' => Hash::make('password'),
      'email_verified_at' => now(),
      // Use config value
      'role' => 'admin' // Config::get('roles.roles.admin'),
    ]);

    User::create([
      'name' => 'Editor User',
      'username' => 'EditorUser',
      'email' => 'editor@example.com',
      'password' => Hash::make('password'),
      // Use config value
      'role' => 'editor' // Config::get('roles.roles.editor'),
    ]);

    User::create([
      'name' => 'Viewer User',
      'username' => 'ViewerUser',
      'email' => 'viewer@example.com',
      'password' => Hash::make('password'),
      // Use config value
      'role' => 'viewer' // Config::get('roles.roles.viewer'),
    ]);
  }
}