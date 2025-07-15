<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
// use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Support\Facades\URL;
use Illuminate\Auth\Events\Verified;
use App\Models\User;

class EmailVerificationController extends Controller{
  // public function index(Request $req, $id, $hash){ // EmailVerificationRequest $req
  //   // $req->fulfill(); // Marks email as verified

  //   if(!URL::hasValidSignature($req)){
  //     return jsonError('Invalid or expired verification link.', 403);
  //   }

  //   $user = $req->user() ?? User::findOrFail($id);

  //   if(!hash_equals((string) $hash, sha1($user->getEmailForVerification()))){
  //     return jsonError('Invalid verification hash.', 403);
  //   }

  //   if(!$user->hasVerifiedEmail()){
  //     $user->markEmailAsVerified();
  //   }

  //   return jsonSuccess($user, 'Email verified successfully');
  // }

  // , $id, $hash
  public function index(Request $req){ // EmailVerificationRequest $req
    // $req->fulfill(); // Marks email as verified

    // ✅ Check if the signed URL is expired or tampered
    if(!URL::hasValidSignature($req)){
      abort(403, 'Invalid or expired verification link.');
    }

    // $user = $req->user() ?? User::findOrFail($id);

    // if(!hash_equals((string) $hash, sha1($user->getEmailForVerification()))){
    //   abort(403, 'Invalid verification hash.');
    // }

    // if(!$user->hasVerifiedEmail()){
    //   $user->markEmailAsVerified();
    // }

    return view('app');
  }

  public function show(Request $req, $id, $hash){
    $user = $req->user() ?? User::findOrFail($id);

    // ✅ Check if the hash matches the user's email
    if(!hash_equals((string) $hash, sha1($user->getEmailForVerification()))){
      return jsonError('Invalid verification hash.', 403);
    }

    // ✅ Check if already verified
    if($user->hasVerifiedEmail()){
      return jsonSuccess($user, 'Email already verified.');
    }

    // ✅ Mark as verified
    $user->markEmailAsVerified();
    event(new Verified($user));

    return jsonSuccess($user, 'Email verified successfully.');
  }

  public function store(Request $req){
    $req->user()->sendEmailVerificationNotification();
    return jsonSuccess('Verification link sent');
  }
}