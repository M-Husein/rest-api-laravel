<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ErrorReport extends Model{
  use HasFactory;

  protected $fillable = [
    'name',
    'message',
    'stack',
    'meta',
    'occurrences',
    'last_occurrence',
    'hash',
  ];

  protected $casts = [
    'meta' => 'array',
    'last_occurrence' => 'datetime',
  ];
}
