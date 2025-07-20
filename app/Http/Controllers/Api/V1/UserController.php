<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\User\StoreUserRequest;
use App\Http\Requests\Api\V1\User\UpdateUserRequest;
use Illuminate\Http\Request; // {Request, Response}
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Spatie\QueryBuilder\AllowedFilter;
use Illuminate\Validation\Rule;
use App\Traits\QueryTools;

class UserController extends Controller{
  use QueryTools;

  public function index(Request $req){
    $this->authorize('manage-users'); // Gate check: only admins can manage users

    $query = $this->buildQuery(
      query: User::class,
      request: $req,
      searches: ['name'],
      filters: [
        'name',
        AllowedFilter::exact('id'),
        AllowedFilter::scope('email_verified_at')
      ],
      sorts: ['id', 'name', 'email', 'created_at'],
      includes: ['avatar', 'role'], // Example = ['category', 'reviews']
    );

    if($req->filled('perPage')){ // $req->perPage
      return $this->paginate($query, $req);
    }

    return $this->streamJson($query);

    // $data = [];

    // User::chunk(1000, function($chunk) use (&$data){
    //   foreach($chunk as $user){
    //     $data[] = $user;
    //   }
    // });

    // return jsonSuccess(User::all()); // User::lazy() | $data
  }

  public function lazy(Request $req){
    $this->authorize('manage-users'); // Only admin

    return $this->simplePaginate(
      query: User::class, // User::query(),
      request: $req,
      searches: ['name'],
      // Optional: filters, sorts, includes like `paginate`
    );
  }

  public function show(User $user){
    // $this->authorize('manage-users'); // Only admins can view specific user details
    return jsonSuccess($user);
  }

  public function store(StoreUserRequest $req){
    $this->authorize('manage-users'); // Only admin

    // Validation is now handled by StoreUserRequest, get the validated data
    $validated = $req->validated();

    // If 'role' is not provided (and it's 'sometimes' in the request), default to 'viewer'.
    // $validated['role'] = $validated['role'] ?? array_search('viewer', config('roles.keys'));
    if(isset($validated['role'])){
      $validated['role'] = array_search('viewer', config('roles.keys'));
    }

    // If username is not provided, use email as username
    if(!isset($validated['username']) || empty($validated['username'])){
      $validated['username'] = $validated['email'];
    }

    /**
     * Consider enforcing at least one number/symbol:
     * 'password' => 'bail|required|string|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/'
     * 
     * No XSS sanitization
     * Laravel validation doesn’t sanitize inputs. Use strip_tags or middleware to prevent HTML/JS injection:
     * 'name' => 'bail|required|string|max:100|regex:/^[^\<\>]*$/',
     */

    $validated['password'] = Hash::make($validated['password']);
    
    $user = User::create($validated);
    
    return jsonSuccess(
      $user,
      'User created successfully',
      201 // Response::HTTP_CREATED
    );
  }

  public function update(UpdateUserRequest $req, User $user){
    $this->authorize('update', $user);

    // Validation is now handled by UpdateUserRequest, get the validated data
    $validated = $req->validated();

    // It's validated by the Form Request's 'in' rule.
    if(isset($validated['role'])){
      $user->role = $validated['role'];
    }

    // Handle password update
    if(isset($validated['password'])){
      $user->password = Hash::make($validated['password']);
    }

    // Fill other attributes from the validated request data.
    // `fill()` is safer than `update()` with `$validated` if not all fields are fillable.
    // `only()` ensures only specified fields are considered from the request.
    $user->fill($req->only(['name', 'email', 'username']));
    $user->save(); // Save all changes to the user model.

    // Prepare the response user object for frontend consistency
    // $roleKey = config('roles.keys.' . $user->role);
    // $roleDisplayName = config('roles.names.' . $user->role);

    return jsonSuccess($user);
  }

  /**
   * Options: Simple without optional query to hard or soft delete,
   * depends on whether `Illuminate\Database\Eloquent\SoftDeletes` is used in the model.
   */
  // public function destroy(string $id){
  //   $user = User::findOrFail($id);
  //   $user->delete();
  //   return response()->noContent();

  //   // Options: With return data.
  //   // return jsonSuccess(
  //   //   '',
  //   //   '',
  //   //   204 // Consider 200 with data or 404/202 if use case requires it
  //   // );
  // }

  public function destroy(User $user){
    // $this->authorize('manage-users'); // Only admin
    $this->authorize('delete', $user); // admin and the user himself

    if($req->hard ?? false){ // $req->boolean('hard', false)
      $user->forceDelete();
    }else{
      /**
       * Option to ensures
       * Safety – Prevents accidental hard deletes when soft deletes are expected.
       * Clarity – Fails fast with a clear error if the model isn’t configured correctly.
       * The model does not have Illuminate\Database\Eloquent\SoftDeletes
       * Consistency – Makes the API behavior predictable.
       */
      // if(!method_exists($user, 'trashed')){
      //   abort(400, 'Soft delete not supported for this model.');
      // }
      $user->delete();
    }

    return response()->noContent();
  }

  public function deletes(Request $req){
    $this->authorize('manage-users'); // Only admin

    $validated = $req->validate([
      'ids' => 'bail|required|array',
      'ids.*' => 'exists:users,id',
      'hard' => 'sometimes|boolean'
    ]);

    // Prevent deleting self from the bulk list
    $userId = $req->user()->id;

    if(in_array($userId, $validated['ids'])){
      return jsonError(
        'You cannot include your own account in a bulk deletion request.',
        403
      );
    }

    // // Prevent deleting self from the bulk list if not admin
    // $user = $req->user();
    // $currentUserId = $user->id; // Auth::id();
    // $adminRoleId = config('roles.keys.admin');
    // $currentUserIsAdmin = $user->hasRole($adminRoleId); // Auth::user()->hasRole($adminRoleId);

    // if(!$currentUserIsAdmin && in_array($currentUserId, $validated['ids'])){
    //   return jsonError(
    //     'You cannot delete your own account from a bulk operation unless you are an administrator.',
    //     403
    //   );
    // }

    // // Fetch users to apply individual policy checks for each deletion.
    // // This is crucial if your UserPolicy::delete has more complex logic than just admin/self.
    // $usersToDelete = User::whereIn('id', $ids)->get();

    // foreach ($usersToDelete as $user) {
    //   // This will throw AccessDeniedHttpException if policy denies.
    //   // The 'delete' policy already handles admin bypass and self-deletion.
    //   // Note: The policy's 'before' method for admin bypass will still apply here.
    //   // If an admin tries to delete another admin, this will pass.
    //   // The above check specifically prevents self-deletion.
    //   $this->authorize('delete', $user);
    // }

    $q = User::whereIn('id', $validated['ids']);

    if($validated['hard'] ?? false){
      $q->chunkById(200, fn($data) => $data->each->forceDelete());
    }else{
      // Option to ensures like `destroy`
      $q->chunkById(200, fn($data) => $data->each->delete());
    }

    return response()->noContent();
  }

  public function listDevices(Request $req){
    $tokens = $req->user()->tokens->map(fn($item) => [
      'id' => $item->id,
      'name' => $item->name,
      // 'abilities' => $item->abilities,
      'user_id' => $item->user_id,
      // 'platform' => $item->platform,
      'ip_address' => $item->ip_address,
      'user_agent' => $item->user_agent,
      'created_at' => $item->created_at, // $item->created_at->toDateTimeString()
      'last_used_at' => $item->last_used_at,
      'expires_at' => $item->expires_at
    ]);
    return jsonSuccess($tokens);
  }

  /**
   * Update the authenticated user's language preference.
   *
   * @param  \Illuminate\Http\Request  $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function language(Request $req){
    $user = $req->user();

    if($user){
      $validated = $req->validate([
        'lang' => [
          'bail',
          'required',
          'string',
          'max:10',
          Rule::in(config('app.locales', [config('app.fallback_locale')])),
        ],
      ]);

      // Update only the 'lang' field
      // This is the fastest way to update a single field:
      $user->forceFill(['lang' => $validated['lang']])->save();
      // Or simply: $user->lang = $validated['lang']; $user->save();
      // forceFill is slightly faster as it bypasses fillable/guarded checks,
      // but $user->lang = ...; $user->save(); is also very fast for one field.

      // Immediately set the application's locale for the current request
      // This ensures subsequent responses in the same request use the new language.

      app()->setLocale($validated['lang']);

      // return jsonSuccess(
      //   1,
      //   // Example translated message
      //   __('api_messages.language_updated_successfully', [], App::getLocale())
      // );

      return jsonSuccess(1);
      // return response()->noContent();
    }

    return jsonError('Unauthenticated.', 401);
  }

  public function theme(Request $req){
    $user = $req->user();

    if($user){
      $validated = $req->validate([
        'theme' => [
          'bail',
          'required',
          'string',
          'max:6', // 20
          Rule::in(['dark', 'light', 'system']),
        ],
      ]);

      $user->forceFill(['theme' => $validated['theme']])->save();

      return jsonSuccess(1);
      // return response()->noContent();
    }

    return jsonError('Unauthenticated.', 401);
  }
}