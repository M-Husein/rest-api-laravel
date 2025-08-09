<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
// use Illuminate\Foundation\Auth\EmailVerificationRequest;
// use Illuminate\Support\Carbon;
// use Illuminate\Support\Facades\URL;
// use Illuminate\Auth\Notifications\VerifyEmail;
// use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Auth\Events\Verified;
use App\Models\User;

class EmailVerificationController extends Controller{
  /**
   * Handle the incoming web request for email verification.
   * This is the method a user hits when clicking the link in their email.
   */
  public function verifyWeb(Request $req, $id, $hash){
    // Find the user. The signed URL check already ensures integrity.
    $user = $req->user() ?? User::findOrFail($id);

    // Check if the hash matches the user's email.
    if(!hash_equals((string) $hash, sha1($user->getEmailForVerification()))){
      abort(403, 'Invalid verification hash.');
    }

    // $redirectUrl = config('app.frontend_url') . '/verification';

    // If the user is already verified, just redirect.
    if($user->hasVerifiedEmail()){
      return redirect(route('login')); // $redirectUrl . '?status=verified'
    }

    // Mark the email as verified.
    $user->markEmailAsVerified();
    event(new Verified($user));

    return redirect(config('app.frontend_url') . '/verification?status=success');
    
    // Alternatively, for a simple Blade view
    // return view('email-verified-success');
  }

  /**
   * Resend the verification email.
   * This is an API endpoint for logged-in users.
   */
  public function send(Request $req){
    if($req->user()->hasVerifiedEmail()){
      return jsonError('Email already verified.', 409);
    }

    $req->user()->sendEmailVerificationNotification();

    return jsonSuccess('Verification link sent');
  }

  // public function index(Request $req, $id, $hash){
  //   // Check if the signed URL is expired or tampered
  //   if(!URL::hasValidSignature($req)){
  //     abort(403, 'Invalid or expired verification link.');
  //     // return redirect()->route('verification.error');
  //   }

  //   $user = $req->user() ?? User::findOrFail($id);

  //   if(!$user){
  //     return abort(404, 'Not found.');
  //   }

  //   // Check if the hash matches the user's email
  //   if(!hash_equals((string) $hash, sha1($user->getEmailForVerification()))){
  //     return abort(403, 'Invalid verification hash.');
  //     // return redirect()->route('verification.error');
  //   }

  //   // Check if already verified
  //   // if(!$user->hasVerifiedEmail()){
  //   //   $user->markEmailAsVerified();
  //   // }

  //   $isVerified = false;

  //   try{
  //     if(!$user->hasVerifiedEmail()){
  //       $user->markEmailAsVerified();
  //     }
  //     $isVerified = $user->hasVerifiedEmail();
  //   }catch(\Throwable $e){
  //     // Log::error('Email verification failed', ['user_id' => $user->id, 'error' => $e->getMessage()]);
  //   }

  //   return view('app', ['user' => $user, 'isVerified' => $isVerified]);
  // }

  // public function verify(Request $req, $id, $hash){
  //   $user = $req->user() ?? User::findOrFail($id);

  //   if(!$user){
  //     return jsonError('Not found.', 404);
  //   }

  //   // Check if the hash matches the user's email
  //   if(!hash_equals((string) $hash, sha1($user->getEmailForVerification()))){
  //     return jsonError('Invalid verification hash.', 403);
  //   }

  //   // Check if already verified
  //   if($user->hasVerifiedEmail()){
  //     return jsonSuccess($user, 'Email already verified.');
  //   }

  //   // Mark as verified
  //   $user->markEmailAsVerified();
  //   event(new Verified($user));

  //   return jsonSuccess($user, 'Email verified successfully.');
  // }

  // // Laravel provides a built-in EmailVerificationRequest class that handles signature and hash checks
  // public function verify(EmailVerificationRequest $request) {
  //   if ($request->user()->hasVerifiedEmail()) {
  //     return jsonSuccess($request->user(), 'Email already verified.');
  //   }

  //   $request->fulfill(); // marks as verified and fires Verified event

  //   return jsonSuccess($request->user(), 'Email verified successfully.');
  // }

  /**
   * Override the default email verification notification
   * to use a custom expiration time and API-friendly link.
   */
  // public function sendEmailVerificationNotification(){
  //   $this->notify(new class($this) extends VerifyEmail{
  //     public function toMail($notifiable){
  //       $expiration = config('auth.verification.expire', 60); // minutes

  //       $verificationUrl = URL::temporarySignedRoute(
  //         'verification.verify',
  //         Carbon::now()->addMinutes($expiration),
  //         [
  //           'id' => $notifiable->getKey(),
  //           'hash' => sha1($notifiable->getEmailForVerification())
  //         ]
  //       );

  //       return (new MailMessage)
  //         ->subject('Verify Your Email')
  //         ->line('Click the button below to verify your email address.')
  //         ->action('Verify Email', $verificationUrl)
  //         ->line("This link will expire in {$expiration} minutes.");
  //     }
  //   });
  // }
}