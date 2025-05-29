<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $admin = User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@email.com',
            'role_id' => 1, // 'SuperAdmin'
            'password' => Hash::make('password'),
        ]);

        $roleAdmin = Role::firstOrCreate(['name' => 'Super Admin']);
        $admin->assignRole($roleAdmin);

        //

        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@email.com',
            'role_id' => 2, // 'Member'
            'password' => Hash::make('password'),
        ]);

        $roleMember = Role::firstOrCreate(['name' => 'Member']);
        $user->assignRole($roleMember);
    }
}
