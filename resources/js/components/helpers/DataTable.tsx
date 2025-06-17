import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cleanQueryObject } from '@/utils/cleanQueryObject';
import { router } from '@inertiajs/react';
import { CheckedState } from '@radix-ui/react-checkbox';
import { ArrowDownZA, ArrowUpAZ, ChevronDown, ListFilter } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { InertiaPaginate } from './InertiaPaginate';

type TableHeader = {
    key: string;
    label: string;
    sortable?: boolean;
};

type TableAction<T> =
    | {
          label: string;
          icon?: React.ReactNode;
          onClick: (item: T) => void;
          className?: string;
          showIf?: (item: T) => boolean;
      }
    | {
          render: (item: T) => React.ReactNode;
          showIf?: (item: T) => boolean;
      };

type DataTableProps<T extends { id: number | string }> = {
    // === Core Table Config ===

    /** Column definitions used to render table headers */
    headers: TableHeader[];

    /** The dataset to render as rows */
    data: T[];

    /** Custom data rendering for specific columns, if any */
    customData?: {
        key: string;
        render: (item: T, index: number) => React.ReactNode;
    }[];

    /** Total number of data not-paginated */
    dataCount?: number;

    /** Named route used by Inertia router.get() for pagination/filtering */
    baseRoute?: string;

    // === Table Appearance ===

    /** Wrapper class for the table container (e.g., for borders, shadows) */
    tableParentClassName?: string;

    /** Class used for the actual <Table> element */
    tableClassName?: string;

    /** Optional name/title of the table (for accessibility or display) */
    name?: string;

    /** Ref to the table element for external manipulation (e.g., scrolling) */
    tableRef?: React.RefObject<HTMLTableElement> | null;

    // === Sorting ===

    /** Default column key to sort by */
    defaultSort?: string | null;

    /** Default sort direction */
    defaultSortDirection?: 'asc' | 'desc';

    // === Search ===

    /** Enable or disable the search input */
    enableSearch?: boolean;

    /** Initial search input value */
    searchDefaultValue?: string;

    // === Filters ===

    /** Available filters that will be rendered as checkboxes */
    filters?: { key: string; label: string; checked?: boolean }[];

    /** Filters to apply initially (used to populate URL or checkbox state) */
    defaultFilters?: string[];

    // === Selection ===

    /** Enable checkbox-based row selection */
    enableSelect?: boolean;

    /** Callback when selected items change */
    onSelectionChange?: (items: T[]) => void;

    // === Actions ===

    /** Render action buttons per row, either declaratively or via function */
    actions?: ((item: T) => React.ReactNode) | TableAction<T>[];

    // === Pagination ===

    /** Current active page */
    paginationCurrentPage?: number;

    /** Total number of pages */
    paginationLastPage?: number;

    /** Class name for the pagination component */
    paginationClassName?: string;

    /** Dropdown of items per page options, please integrate this to your backend to prevent user
     * from manually changing the URL */
    perPagesDropdown?: number[];

    /** Default items per page, defaults to the first item in the dropdown */
    defaultPerPage?: number;

    /** Class name for the pagination component */
    showDebugPreview?: boolean;

    /** Enable or disable index column (e.g., for row numbers) */
    enableIndex?: boolean;

    /** You can get this from Laravel pagination meta data. This is useful for pagination where the first item is not always 1. */
    indexFrom?: number;
};

/** A reusable data table component for displaying and managing tabular data with features like sorting, searching, filtering, and pagination. */
export function DataTable<T extends { id: number | string }>({
    headers,
    data,
    customData = [],
    dataCount = 0,
    baseRoute = 'dashboard',

    tableParentClassName = 'overflow-hidden rounded-lg border shadow-xs',
    tableClassName = 'table-auto border-separate border-spacing-0',
    name = '',
    tableRef = null,

    defaultSort = '',
    defaultSortDirection = 'asc',

    enableSearch = false,
    searchDefaultValue = '',

    filters = [],
    defaultFilters = [],

    enableSelect = false,
    onSelectionChange,

    actions,

    paginationCurrentPage = 1,
    paginationLastPage = 1,
    paginationClassName = 'flex flex-col md:flex-row justify-center gap-2 md:justify-between items-center',

    perPagesDropdown = [5, 10, 25, 50, 100],
    defaultPerPage = 5,

    showDebugPreview = false,

    enableIndex = false,
    indexFrom = 1,
}: DataTableProps<T>) {
    const [page, setPage] = useState(paginationCurrentPage ?? 1);

    const [selectedSort, setSelectedSort] = useState(defaultSort || '');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection || '');
    const [searchParam, setSearchParam] = useState(searchDefaultValue || '');
    const [selectedItems, setSelectedItems] = useState<T[]>([]);
    const [selectedFilters, setSelectedFilters] = useState<string[]>(
        defaultFilters?.length ? defaultFilters : filters?.filter((f) => f.checked).map((f) => f.key) || [],
    );
    const [perPage, setPerPage] = useState(defaultPerPage || 5);

    useEffect(() => {
        onSelectionChange?.(selectedItems);
    }, [selectedItems, onSelectionChange]);

    const toggleSelectAll = (checked: boolean) => {
        setSelectedItems((prev) => {
            const currentPageIds = data.map((item) => item.id);
            const existing = prev.filter((item) => !currentPageIds.includes(item.id));
            return checked ? [...existing, ...data] : existing;
        });
    };

    const toggleSelectOne = (item: T) => {
        setSelectedItems((prev) => (prev.some((i) => i.id === item.id) ? prev.filter((i) => i.id !== item.id) : [...prev, item]));
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            const url = new URL(window.location.href);
            const currentSearch = url.searchParams.get('search') || '';
            const currentFilters = url.searchParams.get('filters') || '';
            const currentSort = url.searchParams.get('sortBy') || '';
            const currentDirection = url.searchParams.get('sortDirection') || '';
            const currentPage = page;
            const currentPerPage = parseInt(url.searchParams.get('perPage') ?? perPagesDropdown[0].toString());

            const filtersStr = selectedFilters.join(',');

            const newQuery = {
                page: currentPage,
                search: searchParam.trim() || undefined,
                filters: filtersStr || undefined,
                sortBy: selectedSort || undefined,
                sortDirection: sortDirection || undefined,
                perPage: perPage,
            };

            const currentQuery = {
                page: parseInt(url.searchParams.get('page') ?? '1'),
                search: currentSearch || undefined,
                filters: currentFilters || undefined,
                sortBy: currentSort || undefined,
                sortDirection: currentDirection || undefined,
                perPage: currentPerPage,
            };

            if (JSON.stringify(newQuery) !== JSON.stringify(currentQuery)) {
                router.get(route(baseRoute), cleanQueryObject(newQuery), {
                    preserveState: true,
                    replace: true,
                });
            }
        }, 250);

        setPage(1);

        return () => clearTimeout(delayDebounce);
    }, [baseRoute, perPage, perPagesDropdown, searchParam, selectedFilters, selectedSort, sortDirection]);

    const pageIds = data.map((item) => item.id);
    const selectedIds = selectedItems.map((item) => item.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    const partiallySelected = pageIds.some((id) => selectedIds.includes(id)) && !allSelected;

    const getCheckedState = (): CheckedState => {
        if (allSelected) return true;
        if (partiallySelected) return 'indeterminate';
        return false;
    };

    const shouldShowActions =
        typeof actions === 'function'
            ? true
            : Array.isArray(actions) && data.some((item) => actions.some((action) => !action.showIf || action.showIf(item)));

    return (
        <>
            <div className="flex flex-col gap-2">
                {/* Filters + Search */}
                <div className="flex w-full flex-col items-start gap-2 md:flex-row md:items-center">
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    {perPage} per page <ChevronDown className="ml-0.5 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-max">
                                <DropdownMenuLabel>Rows per page</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={perPage.toString()} onValueChange={(value) => setPerPage(Number(value))}>
                                    {perPagesDropdown.map((value) => (
                                        <DropdownMenuRadioItem key={value} value={value.toString()} className="cursor-pointer">
                                            {value}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {enableSearch && (
                            <Input
                                type="text"
                                name="search"
                                placeholder="Search..."
                                value={searchParam}
                                onChange={(e) => setSearchParam(e.target.value)}
                                className="w-full md:w-80"
                            />
                        )}
                    </div>

                    {filters.length > 0 && (
                        <div className="flex w-full flex-wrap justify-start gap-3 md:justify-end">
                            <ListFilter size={16} />
                            {filters.map(({ key, label }) => (
                                <div key={key} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={key}
                                        checked={selectedFilters.includes(key)}
                                        onCheckedChange={(checked) => {
                                            setSelectedFilters(checked ? [...selectedFilters, key] : selectedFilters.filter((f) => f !== key));
                                        }}
                                    />
                                    <label
                                        htmlFor={key}
                                        className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className={tableParentClassName}>
                    <Table className={tableClassName} id={name} ref={tableRef}>
                        <TableHeader className="bg-gray-100 dark:bg-transparent">
                            <TableRow className="dark:hover:bg-gray-50/10">
                                {enableSelect && (
                                    <TableHead className="py-2.5 text-center text-white">
                                        <Checkbox id="select-all" checked={getCheckedState()} onCheckedChange={toggleSelectAll} />
                                    </TableHead>
                                )}

                                {enableIndex && <TableHead className="text-center dark:text-white">#</TableHead>}

                                {headers.map(({ key, label, sortable = true }) => (
                                    <TableHead
                                        key={key}
                                        className={`${sortable && 'cursor-pointer'} py-2.5 dark:text-white ${!enableIndex && 'ps-3'}`}
                                        onClick={() => {
                                            if (!sortable) return;
                                            setSelectedSort(key);
                                            setSortDirection((prev) => (selectedSort === key ? (prev === 'asc' ? 'desc' : 'asc') : 'asc'));
                                        }}
                                    >
                                        {sortable ? (
                                            <div className="flex items-center gap-1">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger className="cursor-pointer">{label}</TooltipTrigger>
                                                        <TooltipContent>Click to sort</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                {selectedSort === key &&
                                                    (sortDirection === 'asc' ? (
                                                        <ArrowUpAZ className="ml-1.5 h-4 w-4 text-gray-400" />
                                                    ) : (
                                                        <ArrowDownZA className="ml-1.5 h-4 w-4 text-gray-400" />
                                                    ))}
                                            </div>
                                        ) : (
                                            <span>{label}</span>
                                        )}
                                    </TableHead>
                                ))}
                                {shouldShowActions && <TableHead className="text-center dark:text-white">Actions</TableHead>}
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {data.length > 0 ? (
                                data.map((item, index) => (
                                    <TableRow
                                        key={item.id}
                                        className="font-[400] odd:bg-white even:bg-gray-50 dark:odd:bg-transparent dark:even:bg-transparent dark:hover:bg-gray-50/10"
                                    >
                                        {enableSelect && (
                                            <TableCell className="w-10 py-2.5 text-center">
                                                <Checkbox
                                                    checked={selectedItems.some((i) => i.id === item.id)}
                                                    onCheckedChange={() => toggleSelectOne(item)}
                                                />
                                            </TableCell>
                                        )}

                                        {enableIndex && (
                                            <TableCell className="w-10 py-2.5 text-center dark:text-white">
                                                <span>{indexFrom + index}</span>
                                            </TableCell>
                                        )}

                                        {headers.map(({ key }) => {
                                            const custom = customData?.find((c) => c.key === key);
                                            return (
                                                <TableCell key={key} className={`align-middle dark:text-white ${!enableIndex && 'ps-3'}`}>
                                                    {custom ? custom.render(item, index) : String(item[key as keyof T] ?? '')}
                                                </TableCell>
                                            );
                                        })}

                                        {shouldShowActions && actions && (
                                            <TableCell className="w-max align-middle">
                                                {typeof actions === 'function' ? (
                                                    actions(item)
                                                ) : (
                                                    <div className="flex justify-center gap-2">
                                                        {actions.map((action, idx) =>
                                                            !action.showIf || action.showIf(item) ? (
                                                                'render' in action ? (
                                                                    <React.Fragment key={idx}>{action.render(item)}</React.Fragment>
                                                                ) : (
                                                                    <button
                                                                        key={idx}
                                                                        onClick={() => action.onClick(item)}
                                                                        className={`flex h-6.5 cursor-pointer items-center gap-2 rounded-md border-b-3 border-[#0000002f] px-2 py-0.5 text-sm text-white transition-all duration-75 active:border-b-0 ${action.className}`}
                                                                    >
                                                                        {action.icon}
                                                                        {action.label}
                                                                    </button>
                                                                )
                                                            ) : null,
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={headers.length + (enableSelect ? 1 : 0) + (shouldShowActions ? 1 : 0) + (enableIndex ? 1 : 0)}
                                        className="py-2.5 text-center dark:text-white"
                                    >
                                        No records found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className={paginationClassName}>
                    <div className="text-sm text-gray-500">
                        Showing {data.length} of {dataCount} items
                    </div>
                    <InertiaPaginate
                        currentPage={paginationCurrentPage}
                        lastPage={paginationLastPage}
                        baseRoute={baseRoute}
                        query={{
                            search: searchParam,
                            filters: selectedFilters.length ? selectedFilters.join(',') : undefined,
                            sortBy: selectedSort && sortDirection ? selectedSort : undefined,
                            sortDirection: sortDirection && selectedSort ? sortDirection : undefined,
                            perPage: perPage,
                        }}
                        onPageChange={setPage}
                    />
                </div>
                {showDebugPreview && <pre>{JSON.stringify(selectedItems, null, 2)}</pre>}
            </div>
        </>
    );
}
