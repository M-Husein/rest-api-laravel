<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;

class MakeApiResource extends Command{
    protected $signature = 'make:api-resource {name}';
    protected $description = 'Scaffold API Controller, FormRequest, and Route entry';

    public function handle()
    {
        $name = Str::studly($this->argument('name'));
        $resource = Str::lower(Str::plural($name));

        $this->call('make:controller', [
            'name' => "Api/V1/{$name}Controller",
            '--api' => true
        ]);

        $this->call('make:request', [
            'name' => "Api/V1/{$name}/Store{$name}Request"
        ]);

        $this->call('make:request', [
            'name' => "Api/V1/{$name}/Update{$name}Request"
        ]);

        $this->info("Don't forget to register route: Route::apiResource('{$resource}', {$name}Controller::class);");
    }
}
