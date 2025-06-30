<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder{
  public function run(): void{
    $admin = Role::firstOrCreate(['name' => 'Admin']);
    $member = Role::firstOrCreate(['name' => 'Member']);

    // Assign all permissions to Admin
    $admin->syncPermissions(Permission::all());

      // Member gets limited permissions
    $member->syncPermissions([
      'about.read',
      'contact.read',
      'contact.update',
    ]);
  }
}
