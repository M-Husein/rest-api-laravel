<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder{
  public function run(): void{
    $permissions = [
      'user.create',
      'user.read',
      'user.update',
      'user.delete',
      'user.menu',
    ];

    foreach ($permissions as $perm) {
      Permission::firstOrCreate(['name' => $perm]);
    }
  }
}
