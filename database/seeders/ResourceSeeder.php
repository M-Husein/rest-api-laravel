<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Resource;
use Spatie\Permission\Models\Permission;

class ResourceSeeder extends Seeder{
  protected array $defaultActions = ['create', 'read', 'update', 'delete', 'menu'];

  public function run(): void{
    $resources = [
      [
        'name' => 'user',
        'label' => 'User Management',
        'group' => 'Admin',
        'route' => '/users',
        'icon' => 'users',
        'is_menu' => true,
      ],
      [
        'name' => 'role',
        'label' => 'Role Management',
        'group' => 'Admin',
        'route' => '/roles',
        'icon' => 'shield',
        'is_menu' => true,
      ],
      [
        'name' => 'resource',
        'label' => 'Resource Management',
        'group' => 'Admin',
        'route' => '/resources',
        'icon' => 'list',
        'is_menu' => true,
      ],
      [
        'name' => 'permission',
        'label' => 'Permission Management',
        'group' => 'Admin',
        'route' => '/permissions',
        'icon' => 'lock',
        'is_menu' => true,
      ],

      [
        'name' => 'about',
        'label' => 'About Us',
        'group' => 'Public',
        'route' => '/about-us',
        'icon' => 'info',
        'is_menu' => true,
      ],
      [
        'name' => 'contact',
        'label' => 'Contact Us',
        'group' => 'Public',
        'route' => '/contact-us',
        'icon' => 'phone',
        'is_menu' => true,
      ],
    ];

    foreach ($resources as $res) {
      $resource = Resource::firstOrCreate(
        ['name' => $res['name']],
        $res
      );

      // Create permissions for each action
      foreach ($this->defaultActions as $action) {
        $permName = "{$res['name']}.{$action}";
        Permission::firstOrCreate(['name' => $permName]);
      }
    }
  }
}
