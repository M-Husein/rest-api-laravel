# AuthController

## login option

## login (used)
```php
public function login(LoginRequest $req){
  $remember = $req->boolean('remember');

  if(!Auth::attempt($req->only('email', 'password'), $remember)){
    return jsonError(__('auth.failed'), 401);
  }

  $user = $req->user(); // Get the authenticated user
  $expiresAt = $remember ? now()->addWeeks(4) : now()->addHours(2);

  // ✅ Create token
  $token = $user->createToken(
    $req->type.'-token',
    ['*'],
    $expiresAt
  );

  // ✅ Add metadata to token
  $token->accessToken->update([
    'user_agent' => $req->header('User-Agent') ?? 'Unknown',
    'ip_address' => $req->ip(),
  ]);
  
  if($req->type === 'spa'){
    $req->session()->regenerate();
  }

  return jsonSuccess([
    'user' => $user,
    'token' => $token->plainTextToken,
    'expiresAt' => $expiresAt
  ]); // , 'Login successful'
}
```

## login 2
```php
public function login(LoginRequest $req){
  $this->limitRequest($req, 'login');

  if(!Auth::attempt($req->only('email', 'password'))){
    return jsonError(__('auth.failed'), 401);
  }

  $user = $req->user(); // Get the authenticated user

  // Token expiration: null for long-living if remember = true
  // else 2 hours default
  $expiresAt = $req->boolean('remember') ? null : now()->addHours(2);

  $token = $user->createToken(
    $req->type ?? 'unknown',
    ['*'], // Optional scopes
    $expiresAt
  )->plainTextToken;

  $tokenModel = $user->tokens()->latest()->first();

  if($tokenModel){
    // $tokenModel->user_id = $user->id; // This might be redundant as it's usually set by relation
    $tokenModel->ip_address = $req->ip();
    $tokenModel->user_agent = $req->userAgent();
    // $tokenModel->platform = $req->platform; // $req->input('platform') ?? '';
    $tokenModel->save();
  }

  // Look up the programmatic key and display name using the numeric role ID
  // $roleKey = config('roles.keys.' . $user->role);
  // $roleDisplayName = config('roles.names.' . $user->role);

  return jsonSuccess([
    'user' => $user,
    'token' => $token,
    'expires_at' => $expiresAt
  ]); // , 'Login successful'
}
```

## login 3
```php
// Stateful login for SPA using Sanctum + Cookies
public function loginSession(LoginRequest $req){
  if(!Auth::attempt($req->only('email', 'password'))){
    return jsonError(__('auth.failed'), 401);
  }

  $user = Auth::user();

  return jsonSuccess([
    'user' => $user,
  ], 'Login successful');
}
```

---

## logout option

## logout (used)
```php
public function logout(Request $req){
  // ✅ Revoke current token (for token-based clients)
  $req->user()->currentAccessToken()->delete();

  // ✅ Invalidate session (for SPA clients)
  if($req->hasSession()){
    $req->session()->invalidate();
    $req->session()->regenerateToken();
  }

  return response()->noContent();
}
```

## logout 2
```php
// Only token-based
public function logout(Request $req){
  $req->user()->currentAccessToken()->delete();
  return response()->noContent();
}
```

---

