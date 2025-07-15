<?php
use Spatie\TranslationLoader\TranslationLoaders\{Db,File};
return [
  /*
  * The translation loader will load translations from these loaders.
  * The first loader will be used first, then the second, and so on.
  */
  'loaders' => [
    Db::class,
    File::class,
  ],

  /*
  * The model which will be used to retrieve and store translations.
  * Change this if you want to use your own model that extends the
  * `Spatie\TranslationLoader\LanguageLine` model.
  */
  'model' => Spatie\TranslationLoader\LanguageLine::class,
  // 'model' => App\Models\LanguageLine::class,

  /*
  * This is the translation manager which will be used to retrieve and store translations.
  * Change this if you want to use your own translation manager that extends the
  * `Spatie\TranslationLoader\TranslationLoaderManager` manager.
  */
  'translation_manager' => Spatie\TranslationLoader\TranslationLoaderManager::class,

  /*
  * This is the cache key that will be used to store translations in the cache.
  */
  'cache_key' => 'spatie.translation-loader.translations',

  /*
  * The amount of seconds the translations should be cached.
  * Set to null to cache forever.
  */
  'cache_ttl' => 60 * 24 * 7, // Cache for 1 week

  // The 'database_overrides_file' option was removed in v2.x and implied by loader order.
  // So, listing Db::class first is enough for database to win.
  
  // ???
  // 'groups' => [
  //   'app', // Custom translations (DB)
  //   '*', // All other groups (files first, then DB)
  // ],
  // 'groups' => ['*'], // Handle all groups including Laravel core
];