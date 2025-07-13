<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ArticleController extends Controller{
  public function index(){
    $this->authorize('viewAny', Article::class);
    $articles = Article::all(['id', 'user_id', 'title', 'is_published', 'created_at']);
    return jsonSuccess($articles);
  }

  public function store(Request $request){
    $this->authorize('create', Article::class);

    $request->validate([
      'title' => 'required|string|max:255',
      'content' => 'required|string',
    ]);

    $article = Article::create([
      'user_id' => Auth::id(),
      'title' => $request->title,
      'content' => $request->content,
      'is_published' => false, // New articles are not published by default
    ]);

    return jsonSuccess($article, 'Article created successfully.', 201);
  }

  public function show(Article $article){
    $this->authorize('view', $article);
    return jsonSuccess($article);
  }

  public function update(Request $request, Article $article){
    $this->authorize('update', $article);

    $request->validate([
      'title' => 'sometimes|required|string|max:255',
      'content' => 'sometimes|required|string',
      'is_published' => 'sometimes|boolean',
    ]);

    $article->update($request->only('title', 'content', 'is_published'));

    return jsonSuccess($article, 'Article updated successfully.');
  }

  public function destroy(Article $article){
    $this->authorize('delete', $article);
    $article->delete();
    // return jsonSuccess('', 'Article deleted successfully.', 204);
    return response()->noContent();
  }

  public function publish(Article $article){
    $this->authorize('publish', $article);

    $article->update(['is_published' => true]);

    return jsonSuccess($article, 'Article published successfully.');
  }
}