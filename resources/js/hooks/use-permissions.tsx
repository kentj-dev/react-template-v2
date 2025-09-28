import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export const permissionActions = ['can_view', 'can_create', 'can_update', 'can_delete', 'can_export', 'can_print'];

export function usePermissions() {
    const { auth } = usePage<SharedData>().props;

    const permissions = auth.permissions ?? {};

    const isSuperAdmin = auth.is_super_admin;

    const hasPermission = (path: string, action: string): boolean => {
        if (isSuperAdmin) return true;
        return Array.isArray(permissions[path]) && permissions[path].includes(action);
    };

    const canView = (path: string) => hasPermission(path, 'can_view');
    const canCreate = (path: string) => hasPermission(path, 'can_create');
    const canUpdate = (path: string) => hasPermission(path, 'can_update');
    const canDelete = (path: string) => hasPermission(path, 'can_delete');
    const canExport = (path: string) => hasPermission(path, 'can_export');
    const canPrint = (path: string) => hasPermission(path, 'can_print');

    return {
        hasPermission,
        canView,
        canCreate,
        canUpdate,
        canDelete,
        canExport,
        canPrint,
    };
}
