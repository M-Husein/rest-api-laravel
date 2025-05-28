namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckResourcePermission
{
    public function handle(Request $request, Closure $next, string $resource, string $action)
    {
        $user = $request->user();
        if (!$user || !$user->hasPermission($resource, $action)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return $next($request);
    }
}