<?php
namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy{
  /**
   * Determine whether the user can bypass all policy checks (e.g., for admins).
   * This method is called before any other policy method.
   *
   * @param  \App\Models\User  $user The authenticated user attempting the action.
   * @param  string  $ability The name of the ability being checked (e.g., 'delete', 'update').
   * @return bool|null
   */
  public function before(User $user, string $ability): ?bool{
    // Allow admin role to bypass all checks in this policy
    // config('roles.keys.admin') retrieves the numeric ID for 'admin'
    if($user->hasRole(config('roles.keys.admin'))){
      return true;
    }
    return null; // Continue with other policy methods
  }

  /**
   * Determine whether the current user can update the target user.
   *
   * @param  \App\Models\User  $currentUser The authenticated user attempting the update.
   * @param  \App\Models\User  $targetUser The user being targeted for update.
   * @return \Illuminate\Auth\Access\Response
   */
  public function update(User $currentUser, User $targetUser): Response{
    // An admin can update any user (handled by the 'before' method).
    // A non-admin user can only update their own account.
    return $currentUser->id === $targetUser->id
      ? Response::allow()
      : Response::deny('You do not have permission to update this user.');
  }

  /**
   * Determine whether the current user can delete the target user.
   *
   * @param  \App\Models\User  $currentUser The authenticated user attempting the delete.
   * @param  \App\Models\User  $targetUser The user being targeted for deletion.
   * @return \Illuminate\Auth\Access\Response
   */
  public function delete(User $currentUser, User $targetUser): Response{
    // An admin can delete any user (handled by the 'before' method).
    // A non-admin user can only delete their own account.
    return $currentUser->id === $targetUser->id
      ? Response::allow()
      : Response::deny('You do not have permission to delete this user.');
  }

  // You can add other policy methods here like view, viewAny, create, etc., if needed
  // For example, to allow admins to view any user, but others only their own:
  // public function view(User $currentUser, User $targetUser): Response{
  //   return $currentUser->id === $targetUser->id
  //     ? Response::allow()
  //     : Response::deny('You do not have permission to view this user.');
  // }
}