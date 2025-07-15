<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
// use Illuminate\Support\Facades\Auth;
use App\Traits\RateLimit;

class ClearCacheController extends Controller{
  use RateLimit;

  public function __invoke(Request $req){
    $this->limitRequest($req, 'clear-cache');

    $user = $req->user(); // Auth::user();

    // ✅ Check Super Admin role
    if($user && $user->hasRole('admin')){ // super-admin
      // ✅ Restrict by IP
      // $allowedIps = explode(',', env('MAINTENANCE_ALLOWED_IPS', '127.0.0.1'));
      // if(!in_array($req->ip(), $allowedIps)){
      //   abort(403, 'Access denied from IP: ' . $req->ip());
      // }

      $requested = $req->input('types', []);

      if(empty($requested)){
        return jsonError('No cache types selected.', 422);
      }

      // ✅ Supported cache types
      $validTypes = ['cache','config','route','view','event','compiled'];
      $cleared = [];
      $isAll = empty(array_diff($validTypes, $requested));

      // ✅ If all types are selected, run optimize:clear
      // count(array_intersect($requested, $validTypes)) === count($validTypes)
      if($isAll){
        Artisan::call('optimize:clear');
        $cleared = $validTypes;
      }else{
        foreach($requested as $type){
          if(in_array($type, $validTypes)){
            $command = match($type){
              'cache' => 'cache:clear',
              'config' => 'config:clear',
              'route' => 'route:clear',
              'view' => 'view:clear',
              'event' => 'event:clear',
              'compiled' => 'clear-compiled'
            };
            Artisan::call($command);
            $cleared[] = $type;
          }
        }
      }

      // ✅ Log the action
      \Log::channel('maintenance')->info("Cache cleared by $user->username", [
        'types' => $isAll ? 'optimize' : implode(',', $cleared),
        'user_id' => $user->id,
        'user_email' => $user->email,
        'ip' => $req->ip(),
        'userAgent' => $req->userAgent()
        // 'timestamp' => now()->toDateTimeString()
      ]);

      return jsonSuccess($cleared, 'Cache cleared successfully');
    }
    
    abort(403, 'Unauthorized: Only Admin can clear cache.');
  }
}