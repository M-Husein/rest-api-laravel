<?php
namespace App\Http\Controllers\Api\V1;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\TranslationLoader\LanguageLine;
// use Illuminate\Validation\ValidationException;
// use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Cache;
use App\Traits\QueryTools;

class AppTranslationController extends Controller{
  use QueryTools;

  public function index(Request $req){
    $query = $this->buildQuery(
      query: LanguageLine::class,
      request: $req,
      searches: ['name'],
      filters: ['group','key'],
      sorts: ['group', 'key'],
      includes: ['is_custom'],
    );

    if($req->filled('perPage')){
      return $this->paginate($query, $req);
    }

    return $this->streamJson($query); // LanguageLine::all()

    // $languageLines = LanguageLine::all()->map(function($line){
    //   // Add a flag to indicate if it's a custom entry (can be fully managed)
    //   // or a file-based entry (limited management via DB).
    //   $line->is_custom_entry = (bool) $line->is_custom;
    //   $line->is_file_based_entry = !(bool) $line->is_custom; // Inverse of is_custom

    //   // Optionally, you might want to add the current locale's translation for display
    //   // $line->current_translation = $line->getTranslation('text', App::getLocale(), false);

    //   return $line;
    // });

    // return jsonSuccess($languageLines);
  }

  /**
   * Store a newly created resource in storage.
   * Ensures no conflicts with existing custom translations.
   * Warns about conflicts with file-based translations.
   */
  public function store(Request $request){
    $validated = $request->validate([
      'group' => 'bail|required|string|max:255',
      'key' => 'bail|required|string|max:255',
      'text' => 'bail|required|array', // Expects JSON object like {"en": "...", "id": "..."}
      'text.*' => 'bail|required|string', // Each locale translation is required
    ]);

    // $existingCustomLine = LanguageLine::where('group', $validated['group'])
    //   ->where('key', $validated['key'])
    //   // ->where('is_custom', true)
    //   ->first();

    // Check for existing translation
    $existingCustomLine = LanguageLine::where([
      ['group', '=', $validated['group']],
      ['key', '=', $validated['key']],
      // ['is_custom', '=', true],
    ])->first();

    if($existingCustomLine){
      return jsonError('Conflict: A translation with this group & key already exists.', 409);
    }

    // Check for file-based translation conflict
    $isFileBasedConflict = $this->hasFileBasedConflict($validated['group'], $validated['key']);

    if($isFileBasedConflict && !$request->boolean('force')){
      return jsonError('Conflict with file-based translation. Use force=true to override.', 409);
    }

    $languageLine = LanguageLine::create([
      'group' => $validated['group'],
      'key' => $validated['key'],
      'text' => $validated['text'],
      'is_custom' => true, // Mark as custom to check this is can edit & delete
    ]);

    // Clear translation cache
    Cache::forget(config('translation-loader.cache_key', 'spatie.translation-loader.translations'));

    // $responseMessage = 'Translation line created successfully.';
    // if($isFileBasedConflict){
    //   $responseMessage .= ' Note: A file-based translation with the same key exists and will take precedence.';
    // }
    return jsonSuccess($languageLine, '', 201); // $responseMessage | ''
  }

  protected function hasFileBasedConflict(string $group, string $key): bool{
    foreach(config('app.paths') as $basePath){
      $phpFilePath = "{$basePath}/{$group}.php";
      $jsonFilePath = "{$basePath}/{$key}.json";

      if($group === 'single' && File::exists($jsonFilePath)){
        return true;
      }

      if($group !== 'single' && File::exists($phpFilePath)){
        try{
          $fileContent = require $phpFilePath;
          if(is_array($fileContent) && array_key_exists($key, $fileContent)){
            return true;
          }
        }catch(\Throwable $e){
          // Ignore malformed files
        }
      }
    }
    return false;

    // Check for conflict with existing FILE-BASED translations (for warning purposes)
    // This requires dynamically checking the file system, which can be slow.
    // A more performant approach would be to have a cached list of file-based keys.
    // $isFileBasedConflict = false;
    // foreach (config('app.paths') as $basePath) {
    //   $phpFilePath = "{$basePath}/{$validated['group']}.php";
    //   $jsonFilePath = "{$basePath}/{$validated['key']}.json"; // For root-level JSON (group 'single')

    //   if ($validated['group'] === 'single' && File::exists("{$basePath}/{$validated['key']}.json")) {
    //     $isFileBasedConflict = true;
    //     break;
    //   } elseif ($validated['group'] !== 'single' && File::exists($phpFilePath)) {
    //     // For PHP files, we need to load the file and check if the key exists within it
    //     try {
    //       $fileContent = require $phpFilePath;
    //       if (is_array($fileContent) && array_key_exists($validated['key'], $fileContent)) {
    //         $isFileBasedConflict = true;
    //         break;
    //       }
    //     } catch (\Throwable $e) {
    //       // Ignore errors from malformed files during check
    //     }
    //   }
    //   // TODO: Add logic for vendor file paths if you want to warn about those too
    //   // This check can become very complex and slow if done for every store request.
    //   // Consider if this warning is truly necessary or if the "file takes precedence" rule is enough.
    // }
  }

  /**
   * Display the specified resource.
   * Differentiates between default (file-based) and custom (DB-only) translations.
   */
  public function show(LanguageLine $app_translation){
    // Option to change type
    $app_translation->is_custom = (bool) $app_translation->is_custom;
    return jsonSuccess($app_translation);
  }

  /**
   * Update the specified resource in storage.
   * Can only change 'text' for file-based entries. Can change all for custom entries.
   */
  public function update(Request $request, string $id){
    $languageLine = LanguageLine::findOrFail($id);
    if(!$languageLine){
      return jsonError(__('api_messages.resource_not_found'), 404);
    }

    $rules = [];
    $dataToUpdate = [];
    $responseMessage = 'Translation line updated successfully.';

    if ($languageLine->is_custom) {
      // For custom entries, allow changing group, key, and text
      $rules = [
        'group' => 'bail|sometimes|required|string|max:255',
        'key' => 'bail|sometimes|required|string|max:255',
        'text' => 'bail|sometimes|required|array',
        'text.*' => 'bail|sometimes|required|string',
      ];
      $dataToUpdate = $request->only(['group', 'key', 'text']);

      // If group or key are being changed, check for conflicts with other custom entries
      if ($request->has('group') || $request->has('key')) {
        $newGroup = $request->input('group', $languageLine->group);
        $newKey = $request->input('key', $languageLine->key);

        $conflict = LanguageLine::where('group', $newGroup)
          ->where('key', $newKey)
          ->where('is_custom', true)
          ->where('id', '!=', $languageLine->id)
          ->first();
        if ($conflict) {
          return jsonError(
            'Conflict: Another custom translation with this group and key already exists.',
            409,
            [
              'group_key' => ['Another custom translation with this group and key already exists.']
            ]
          );
        }
      }

    } else {
      // For file-based entries, only allow changing 'text'
      $rules = [
        'text' => 'bail|required|array',
        'text.*' => 'bail|required|string',
      ];
      $dataToUpdate = $request->only('text');
      $responseMessage = 'Translation line text updated in database. Note: This change will only take effect if the corresponding file-based translation is removed or loader priority is changed.';
    }

    $validated = $request->validate($rules);
    $languageLine->update($dataToUpdate);

    // Clear translation cache
    Cache::forget(config('translation-loader.cache_key', 'spatie.translation-loader.translations'));

    return jsonSuccess($languageLine, $responseMessage);
  }

  /**
   * Remove the specified resource from storage.
   * Can only delete custom-made translations.
   */
  public function destroy(string $id){
    $languageLine = LanguageLine::findOrFail($id);

    if(!$languageLine){
      return jsonError(__('api_messages.resource_not_found'), 404);
    }

    if($languageLine->is_custom){
      $languageLine->delete();
      // Clear translation cache
      Cache::forget(config('translation-loader.cache_key', 'spatie.translation-loader.translations'));
      return response()->noContent();
    }
    // 403 Forbidden
    return jsonError('Only custom translations can be deleted.', 403);
  }
}