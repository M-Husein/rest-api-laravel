<?php
namespace App\Http\Middleware;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

class HybridCsrf extends VerifyCsrfToken{
	protected function tokensMatch($req){
		// Skip CSRF for mobile apps or external clients (Bearer token + no Origin)
		if($req->bearerToken() && !$req->headers->has('Origin')){
			return true;
		}

		// Enforce same-origin policy for browser-based clients
		// $origin = $req->headers->get('Origin');
		// $host = $req->getSchemeAndHttpHost();
		// if($origin && $origin !== $host){
		// 	return false;
		// }

		return parent::tokensMatch($req);
	}
}
