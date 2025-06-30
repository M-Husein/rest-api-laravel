<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder{
  public function run(): void{
    $this->call([
      // Seed resources first to ensure permissions are available
      ResourceSeeder::class, // creates resources + permissions
      RoleSeeder::class,     // assigns role permissions (custom per role)
      UserSeeder::class,     // assigns users to roles
    ]);
  }
}
