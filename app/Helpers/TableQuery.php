<?php

namespace App\Helpers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class TableQuery
{
    public static function build(
        Request $request,
        Builder $query,
        array $config
    ): array {
        $page = (int) $request->get("page", 1);
        $search = $request->query('search');
        $filters = $request->query('filters');
        $sortBy = $request->query('sortBy');
        $sortDirection = $request->query('sortDirection');
        $perPagesDropdown = $config['perPagesDropdown'] ?? [5, 10, 25, 50, 100];
        $defaultSortBy = $config['defaultSortBy'] ?? 'created_at';
        $defaultSortDirection = $config['defaultSortDirection'] ?? 'desc';
        $sortFields = $config['sortFields'] ?? [];
        $defaultFilter = $config['defaultFilter'] ?? [];
        $with = $config['with'] ?? [];
        $baseModel = $config['baseModel'] ?? null;
        $select = $config['select'] ?? null;

        $perPage = (int) $request->query('perPage', $perPagesDropdown[2]);
        if (!in_array($perPage, $perPagesDropdown)) {
            $perPage = $perPagesDropdown[0];
        }

        $filterValues = array_filter(explode(',', $filters ?? ''));

        // Filters
        if (isset($config['applyFilters']) && is_callable($config['applyFilters'])) {
            $query = call_user_func($config['applyFilters'], $query, $filterValues);
        }

        // Search
        if ($search && isset($config['applySearch']) && is_callable($config['applySearch'])) {
            $query = call_user_func($config['applySearch'], $query, $search);
        }

        // Select columns
        if ($select && is_array($select) && count($select)) {
            $query->select($select);
        }

        // Sort
        if (in_array($sortBy, $sortFields) && in_array($sortDirection, ['asc', 'desc'])) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy($defaultSortBy, $defaultSortDirection);
        }

        // Relations
        if (!empty($config['withSelect'])) {
            foreach ($config['withSelect'] as $relation => $columns) {
                $query->with([$relation => function ($q) use ($columns) {
                    $q->select($columns);
                }]);
            }

        } elseif (!empty($with)) {
            $query->with($with);
        }

        // Pagination
        $paginated = $query->paginate($perPage)->withQueryString();

        // Fallback if page out of range
        if ($page > $paginated->lastPage()) {
            return [
                'redirect' => [
                    'page' => 1,
                ],
            ];
        }

        $allCount = $baseModel ? $baseModel::count() : $query->toBase()->getCountForPagination();

        return [
            'paginated' => $paginated,
            'tableData' => [
                'search' => $search,
                'filters' => $filterValues,
                'sort' => $sortBy,
                'direction' => $sortDirection,
                'page' => $page,
                'perPage' => $perPage,
                'perPagesDropdown' => $perPagesDropdown,
            ],
            'allCount' => $allCount,
        ];
    }
}
