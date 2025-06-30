<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Resource extends Model{
  protected $fillable = [
    'name',
    'label',
    'group',
    'route',
    'icon',
    'is_menu',
  ];

  public function permissions(){
    return $this->hasMany(\Spatie\Permission\Models\Permission::class, 'name', 'name');
  }
}