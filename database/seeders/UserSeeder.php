<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
// use Illuminate\Support\Facades\Config; // Import Config

class UserSeeder extends Seeder{
  public function run(): void{
    // Get role IDs from config using array_search
    $adminId = array_search('admin', config('roles.keys'));
    $editorId = array_search('editor', config('roles.keys'));
    $viewerId = array_search('viewer', config('roles.keys'));
    
    User::create([
      'name' => 'Admin User',
      'username' => 'SuperAdmin',
      'email' => 'admin@email.com',
      'password' => Hash::make('password'),
      'email_verified_at' => now(),
      'role' => $adminId,
      'lang' => config('app.locale'),
      // 'theme' => 'light',
    ]);

    User::create([
      'name' => 'Editor User',
      'username' => 'EditorUser',
      'email' => 'editor@email.com',
      'password' => Hash::make('password'),
      'email_verified_at' => now(),
      'role' => $editorId,
      'lang' => config('app.locale'),
    ]);

    User::create([
      'name' => 'Viewer User',
      'username' => 'ViewerUser',
      'email' => 'viewer@email.com',
      'password' => Hash::make('password'),
      'email_verified_at' => now(),
      'role' => $viewerId,
      'lang' => config('app.locale'),
    ]);
  }
}
