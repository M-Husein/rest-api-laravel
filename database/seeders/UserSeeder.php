<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder{
  public function run(): void{
    // Admin User
    $admin = User::firstOrCreate(
      ['email' => 'admin@email.com'],
      [
        'name' => 'Admin',
        'username' => 'SuperAdmin',
        'password' => Hash::make('password'),
        'email_verified_at' => now(),
      ]
    );
    $admin->assignRole('Admin');

    // Member User
    $member = User::firstOrCreate(
      ['email' => 'test.user@email.com'],
      [
        'name' => 'Test User',
        'username' => 'TestUser',
        'password' => Hash::make('password'),
      ]
    );
    $member->assignRole('Member');
  }
}
