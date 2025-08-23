<?php
namespace App\Traits;
use Illuminate\Support\Str;

trait StrUnique{
  /**
   * Generate a unique username from an email by appending the current datetime
   * @param  string  $email
   * @return string
   */
  protected function setUsername(string $email): string{
    $base = Str::slug(Str::before($email, '@'), '');
    return (empty($base) ? 'user' : Str::limit($base, 15, '')) . Str::random(8);
  }

  // protected function generateUsername(string $email): string{
  //   $base = Str::slug(Str::before($email, '@'), ''); // Use only part before @ to avoid showing domain in username
  //   if(empty($base)){
  //     $base = 'user';
  //   }
  //   // return Str::limit($base, 15, '') . Str::lower(Str::random(8)); // 32
  //   // return Str::limit($base, 15, '') . substr(md5($email), 0, 6);
  //   // return Str::limit($base, 15, '') . '_' . now()->format('YmdHisv'); // 33
  //   return Str::limit($base, 15, '') . substr(sha1($email . Str::random()), 0, 8); // 32
  // }


  // protected function generateUniqueUsername(string $baseString): string{
  //   $username = Str::limit(Str::slug($baseString, ''), 20, '');

  //   if(empty($username)){
  //     $username = 'user';
  //   }

  //   $originalUsername = $username;

  //   for($i = 0; $i <= 100; $i++){
  //     if(!User::where('username', $username)->exists()){
  //       return $username;
  //     }
  //     $username = $originalUsername . ($i + 1);
  //   }

  //   return $originalUsername . Str::random(4);
  // }

  /**
   * Generates a unique username based on a base string.
   * @param string $baseString The string to derive the username from (e.g., user's name or email part).
   * @return string A unique username.
   */
  // protected function generateUniqueUsername2(string $baseString): string{
  //   // Clean the base string to make it URL-friendly, remove spaces, lowercase
  //   $baseUsername = Str::slug($baseString, '');
  //   // Limit length to avoid excessively long usernames
  //   $username = Str::limit($baseUsername, 20, '');

  //   // Fallback if the base string is empty or results in an empty slug
  //   if(empty($username)){
  //     $username = 'user';
  //   }

  //   $originalUsername = $username;
  //   $i = 0;

  //   // Check if username already exists, append a number if it does
  //   while(User::where('username', $username)->exists()){
  //     $i++;
  //     $username = $originalUsername.$i;
  //     if($i > 100){ // Safety break to prevent infinite loops for very common names
  //       $username = $originalUsername.Str::random(4); // Add random suffix if many attempts
  //       break;
  //     }
  //   }
  //   return $username;
  // }
}