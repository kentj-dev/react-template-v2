<?php

namespace App\Http\Controllers\RoleManagement;

use App\Attributes\RoleAccess;
use App\Models\Role;
use App\Models\Module;
use App\Models\RoleUser;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\ModulePermission;
use App\Helpers\TableQuery;

class RolesController extends Controller
{
    #[RoleAccess('Roles', 'can_view')]
    public function create(Request $request): InertiaResponse|RedirectResponse
    {
        $result = TableQuery::build($request, Role::with('users'), [
            'sortFields' => ['id', 'name', 'description', 'created_at'],
            'defaultSortBy' => 'name',
            'defaultSortDirection' => 'asc',
            'perPagesDropdown' => [5, 10, 25, 50, 100],
            'baseModel' => Role::class,
            'with' => ['users'],
            'applySearch' => function ($query, $search) {
                $term = ltrim($search, '!');
                $query->where(function ($q) use ($term) {
                    $q->where('name', 'like', "%{$term}%")
                      ->orWhere('description', 'like', "%{$term}%");
                });
                return $query;
            },
        ]);

        if (isset($result['redirect'])) {
            return redirect()->route('roles', array_merge(
                $request->except('page'),
                $result['redirect']
            ));
        }

        return Inertia::render('role-management/roles', [
            'roles' => $result['paginated'],
            'tableData' => $result['tableData'],
            'allRolesCount' => $result['allCount'],
        ]);
    }

    #[RoleAccess('Roles', 'can_delete')]
    public function delete(Request $request): RedirectResponse
    {
        $roleId = $request->route('id');

        $role = Role::find($roleId);
        $role->delete();

        return redirect()->back();
    }

    #[RoleAccess('Roles', 'can_update')]
    public function revokeUserRole(Request $request): RedirectResponse
    {
        $userId = $request->route('id');
        $roleId = $request->roleId;

        $roleUser = RoleUser::where('user_id', operator: $userId)
            ->where('role_id', $roleId)
            ->whereNull('deleted_at')
            ->first();

        if ($roleUser) {
            $roleUser->delete();
        }

        return redirect()->back()->with('success', 'Role revoked successfully.');
    }

    #[RoleAccess('Roles', 'can_update')]
    public function revertUserRole(Request $request): RedirectResponse
    {
        $userId = $request->route('id');
        $roleId = $request->roleId;

        $roleUser = RoleUser::withTrashed()
            ->where('user_id', $userId)
            ->where('role_id', $roleId)
            ->first();

        if ($roleUser) {
            $roleUser->restore();
        }

        return redirect()->back()->with('success', 'Role restored successfully.');
    }

    #[RoleAccess('Roles', 'can_update')]
    public function viewRolePermissions(Request $request): InertiaResponse
    {
        $roleId = $request->route('id');

        $role = Role::with(['modulePermissions'])->findOrFail($roleId);

        $modules = Module::with('children')
            ->whereNull('parent_id')
            ->where('is_client', $request->attributes->get('isClientRoute', false))
            ->orderBy('order')
            ->get();

        $permissions = $role->modulePermissions
            ->groupBy('module_id')
            ->map(fn ($perms) => $perms->pluck('name')->values())
            ->toArray();

        return Inertia::render('role-management/manage-role', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'description' => $role->description,
                'for_admin' => $role->for_admin,
                'permissions' => $permissions,
            ],
            'modules' => $modules,
        ]);
    }

    #[RoleAccess('Roles', 'can_update')]
    public function manageRoleModulePermissions(Request $request): RedirectResponse
    {
        $roleId = $request->roleId;

        $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('roles')->ignore($roleId),
            ],
            'description' => [
                'nullable',
                'string',
                'max:255',
            ],
            'permissions' => 'nullable|array',
            'permissions.*' => 'array',
        ]);

        $permissionsInput = $request->permissions ?? [];
        $roleName = $request->name;
        $roleDescription = $request->description;
        $forAdmin = $request->for_admin ?? false;

        DB::transaction(function () use ($roleId, $permissionsInput, $roleName, $roleDescription, $forAdmin) {
            if (!$forAdmin) {
                ModulePermission::where('role_id', $roleId)->delete();
            } else {
                $existingPermissions = ModulePermission::withTrashed()
                    ->where('role_id', $roleId)
                    ->get()
                    ->groupBy(fn ($perm) => $perm->module_id . '|' . $perm->name);

                $submittedKeys = [];

                foreach ($permissionsInput as $moduleId => $actions) {
                    foreach ($actions as $action) {
                        $key = "$moduleId|$action";
                        $submittedKeys[] = $key;

                        if (isset($existingPermissions[$key])) {
                            $existing = $existingPermissions[$key]->first();

                            if ($existing->trashed()) {
                                $existing->restore();
                            }
                        } else {
                            ModulePermission::create([
                                'role_id' => $roleId,
                                'module_id' => $moduleId,
                                'name' => $action,
                            ]);
                        }
                    }
                }

                foreach ($existingPermissions as $key => $records) {
                    if (!in_array($key, $submittedKeys)) {
                        $activeRecord = $records->firstWhere(fn ($r) => !$r->trashed());
                        if ($activeRecord) {
                            $activeRecord->delete();
                        }
                    }
                }
            }

            DB::table('roles')->where('id', $roleId)->update([
                'name' => $roleName,
                'description' => $roleDescription,
                'for_admin' => $forAdmin,
            ]);
        });

        return redirect()->back()->with('success', 'Role permissions updated successfully.');
    }

    #[RoleAccess('Roles', 'can_create')]
    public function createRole(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:' . Role::class
            ],
            'description' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        $roleName = $request->name;
        $roleDescription = $request->description;

        $role = Role::create([
            'name' => $roleName,
            'description' => $roleDescription
        ]);

        return
            redirect()
            ->route('roles.view', $role->id)
            ->with('success', 'User created successfully.');
    }
}
