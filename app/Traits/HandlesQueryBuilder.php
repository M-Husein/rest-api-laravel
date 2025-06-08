<?php
namespace App\Traits;

use Illuminate\Http\Request;
use Spatie\QueryBuilder\{QueryBuilder, AllowedFilter, AllowedSort};
// use App\Traits\ApiResponse;

trait HandlesQueryBuilder{
  // use ApiResponse;

  /**
   * Applies query builder with filters, sorts, and includes
   */ 
  protected function buildQuery(
    $query,
    array $searches = [], // searchableFields
    array $filters = [],
    array $sorts = [],
    array $includes = [],
  ){
    $qb = QueryBuilder::for($query);

    // Add global search when 'q' parameter exists
    if(request()->has('q')){
      $searchValue = request('q');
      $qb->where(function($query) use ($searchValue, $searches){
        foreach($searches as $field){
          $query->orWhere($field, 'LIKE', "%{$searchValue}%");
        }
      });
    }
    
    return $qb->allowedFilters($this->getFilters($filters))
      ->allowedSorts($this->getSorts($sorts))
      ->allowedIncludes($includes);
      // Option: Only select from filters
      // ->select($filters ?? '*'); // 'id', 'name'
  }

  protected function getFilters(array $filters): array{
    return array_map(
      fn($filter) => is_string($filter) ? AllowedFilter::exact($filter) : $filter, 
      $filters
    );
  }

  protected function getSorts(array $sorts): array{
    return array_map(
      fn($sort) => is_string($sort) ? AllowedSort::field($sort) : $sort,
      $sorts
    );
  }

  /**
   * Datatables with pagination, search, filter, sort
   * @return Spatie\QueryBuilder\QueryBuilder
   */
  protected function paginate(
    $query,
    Request $request,
    array $searches = [], // searchableFields
    array $filters = [],
    array $sorts = [],
    array $includes = []
  ){
    // Option
    // $perPage = min(
    //   $request->perPage ?? config('api.per_page', 10),
    //   config('api.max_per_page') // Prevent excessively large pages
    // );

    // logger($request->query());

    return response()->json(
      $this->buildQuery($query, $searches, $filters, $sorts, $includes)
        ->simplePaginate($request->perPage ?? config('api.per_page', 10))
        ->appends($request->query()) // ->appends($request->except('page'));
    );
  }
}
