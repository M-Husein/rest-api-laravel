<?php
namespace App\Traits;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\{QueryBuilder, AllowedFilter, AllowedSort};

trait QueryTools{
  /**
   * Applies query builder with filters, sorts, and includes
   */ 
  protected function buildQuery(
    Builder | QueryBuilder | string $query,
    Request $request,
    array $searches = [], // searchableFields
    ?array $filters = null,
    ?array $sorts = null,
    ?array $includes = null
  ){
    $qb = QueryBuilder::for($query);

    // Add global search when 'q' parameter exists
    if($searches && $request->has('q')){
      $searchValue = $request->q;
      $qb->where(function($query) use ($searchValue, $searches){
        foreach($searches as $field){
          $query->orWhere($field, 'LIKE', "%{$searchValue}%");
        }
      });
    }

    $filters !== null && $qb->allowedFilters($this->getFilters($filters));
    $sorts !== null && $qb->allowedSorts($this->getSorts($sorts));
    $includes !== null && $qb->allowedIncludes($includes);
    
    return $qb;
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
   * @param \Illuminate\Database\Eloquent\Builder|\Spatie\QueryBuilder\QueryBuilder $query
   * Datatables with pagination, search, filter, sort
   * @return Spatie\QueryBuilder\QueryBuilder
   */
  protected function paginate(
    Builder | QueryBuilder $query,
    Request $request
  ){
    return response()->json(
      $query
        ->paginate($request->perPage ?? config('api.per_page', 10))
        ->appends($request->query())
    );
  }
  
  // protected function paginate(
  //   Builder|string $query,
  //   Request $request,
  //   array $searches = [], // searchableFields
  //   array $filters = [],
  //   array $sorts = [],
  //   ?array $includes = null
  // ){
  //   // Option
  //   // $perPage = min(
  //   //   $request->perPage ?? config('api.per_page', 10),
  //   //   config('api.max_per_page') // Prevent excessively large pages
  //   // );

  //   // logger($request->query());

  //   return response()->json(
  //     $this->buildQuery($query, $request, $searches, $filters, $sorts, $includes)
  //       ->paginate($request->perPage) //  ?? config('api.per_page', 10)
  //       ->appends($request->query()) // ->appends($request->except('page'));
  //   );
  // }

  /**
   * Datatables with pagination, search.
   * Usage for infinite scroll/lazy loading
   * @return Spatie\QueryBuilder\QueryBuilder
   */
  protected function simplePaginate(
    Builder|string $query,
    Request $request,
    array $searches = [],
    ?array $filters = null,
    ?array $sorts = null,
    ?array $includes = null
  ){
    // Option data
    // [
    //   'data' => $data->items(),
    //   'page' => $data->currentPage(),
    //   'perPage' => $data->perPage(),
    //   'next' => $data->nextPageUrl()
    // ]

    return response()->json(
      $this->buildQuery($query, $request, $searches, $filters, $sorts, $includes)
        ->simplePaginate($request->perPage ?? config('api.per_page', 10))
        ->appends($request->query())
    );
  }

  protected function streamJson($query){
    return response()->stream(function() use ($query){
      echo '[';
      foreach($query->lazy() as $index => $model){
        if($index > 0){
          echo ',';
        }
        echo json_encode($model, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
      }
      echo ']';
    }, 200, ['Content-Type' => 'application/json']);
  }
}
