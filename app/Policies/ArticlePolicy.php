<?php
namespace App\Policies;
use App\Models\User;
use App\Models\Article;
use Illuminate\Auth\Access\Response;

class ArticlePolicy{
  // Super Admin bypass for all Policy methods
  public function before(User $user, string $ability): ?bool{
    // if ($user->hasRole(config('roles.admin'))) {
    if ($user->hasRole('admin')) {
      return true;
    }
    return null;
  }

  public function viewAny(User $user): Response{
    // return $user->hasAnyRole([config('roles.admin'), config('roles.editor'), config('roles.viewer')])
    return $user->hasAnyRole(['admin', 'editor', 'viewer'])
      ? Response::allow()
      : Response::deny('You do not have permission to view articles.');
  }

  public function view(User $user, Article $article): Response{
    // return $user->hasAnyRole([config('roles.admin'), config('roles.editor'), config('roles.viewer')])
    return $user->hasAnyRole(['admin', 'editor', 'viewer'])
      ? Response::allow()
      : Response::deny('You do not have permission to view this article.');
  }

  public function create(User $user): Response{
    // return $user->hasAnyRole([config('roles.admin'), config('roles.editor')])
    return $user->hasAnyRole(['admin', 'editor'])
      ? Response::allow()
      : Response::deny('You do not have permission to create articles.');
  }

  public function update(User $user, Article $article): Response{
    // return ($user->hasRole(config('roles.admin')) || ($user->hasRole(config('roles.editor')) && $user->id === $article->user_id))
    return ($user->hasRole('admin') || ($user->hasRole('editor') && $user->id === $article->user_id))
      ? Response::allow()
      : Response::deny('You do not have permission to update this article.');
  }

  public function delete(User $user, Article $article): Response{
    // return ($user->hasRole(config('roles.admin')) || ($user->hasRole(config('roles.editor')) && $user->id === $article->user_id))
    return ($user->hasRole('admin') || ($user->hasRole('editor') && $user->id === $article->user_id))
      ? Response::allow()
      : Response::deny('You do not have permission to delete this article.');
  }

  public function publish(User $user, Article $article): Response{
    // return ($user->hasRole(config('roles.admin')) || ($user->hasRole(config('roles.editor')) && $user->id === $article->user_id))
    return ($user->hasRole('admin') || ($user->hasRole('editor') && $user->id === $article->user_id))
      ? Response::allow()
      : Response::deny('You do not have permission to publish this article.');
  }
}