<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceLog extends Model{
  protected $fillable = ['user_id', 'device_name', 'ip_address', 'user_agent', 'platform'];

  public function user(){
    return $this->belongsTo(User::class);
  }
}
