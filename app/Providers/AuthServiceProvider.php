<?php
namespace App\Providers;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\User;

class AuthServiceProvider extends ServiceProvider{
  /**
   * Register services.
   */
  public function register(): void{
    //
  }

  /**
   * The policy mappings for the application.
   */
  protected $policies = [
    // 'App\Models\Model' => 'App\Policies\ModelPolicy',
  ];

  /**
   * Bootstrap services.
   * Register any authentication / authorization services.
   */
  public function boot(): void{
    $this->registerPolicies();

    // Define your custom gates here
    Gate::define('manage roles', function(User $user){
      return $user->hasRole('Admin'); // or customize logic
    });
  }
}
