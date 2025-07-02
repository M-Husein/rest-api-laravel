<?php
namespace App\Providers;
use App\Models\User;
use App\Models\Article;
use App\Policies\ArticlePolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Auth\Access\Response;

class AuthServiceProvider extends ServiceProvider{
  protected $policies = [
    Article::class => ArticlePolicy::class,
    User::class => UserPolicy::class
  ];

  public function boot(): void{
    // Define Gates for specific permissions
    Gate::define('manage-users', function (User $user) {
      return $user->hasRole('admin') // 'admin' | config('roles.keys.1')
        ? Response::allow()
        : Response::deny('You must be an administrator to manage users.');
    });

    Gate::define('edit-articles', function (User $user) {
      // return $user->hasRole(config('roles.admin')) || $user->hasRole(config('roles.editor'))
      return $user->hasRole('admin') || $user->hasRole('editor')
        ? Response::allow()
        : Response::deny('You do not have permission to edit articles.', 403);
    });

    Gate::define('publish-articles', function (User $user) {
      // return $user->hasRole(config('roles.admin')) || $user->hasRole(config('roles.editor'))
      return $user->hasRole('admin') || $user->hasRole('editor')
        ? Response::allow()
        : Response::deny('You do not have permission to publish articles.');
    });

    Gate::define('view-articles', function (User $user) {
      // return $user->hasRole(config('roles.admin')) || $user->hasRole(config('roles.editor')) || $user->hasRole(config('roles.viewer'))
      return $user->hasRole('admin') || $user->hasRole('editor') || $user->hasRole('viewer')
        ? Response::allow()
        : Response::deny('You do not have permission to view articles.');
    });

    // Super Admin bypass for all Gates
    Gate::before(function (User $user, string $ability) {
      // if ($user->hasRole(config('roles.admin'))) {
      if ($user->hasRole('admin')) {
        return true;
      }
      return null;
    });
  }
}