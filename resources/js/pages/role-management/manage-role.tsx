import Heading from '@/components/heading';
import ManageFormLayout, { Field } from '@/components/helpers/ManageFormLayout';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { formatDateFull } from '@/utils/dateHelper';
import { Head, useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';

type Role = {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    for_admin: boolean;
    permissions: Record<string, string[]>;
};

interface Module {
    id: string;
    name: string;
    icon: string;
    path: string;
    order: number;
    is_client: boolean;
    description: string;
    group_title: string;
    created_at: string;
    updated_at: string;

    available_actions: string[];
    children?: Module[];
}

interface RolePermissionsProps {
    role: Role;
    modules: Module[];
}

type ManageRoleForm = {
    name: string;
    description: string;
    for_admin: boolean;
    roleId: string;
    permissions: Record<string, string[]>;
};

export default function RolePermissions({ role, modules }: RolePermissionsProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Roles',
            href: '/roles',
        },
        {
            title: role.name,
            href: `/roles/view/${role.id}`,
        },
    ];

    const { auth } = usePage<SharedData>().props;
    const currentUserRoles = auth.user.roles;

    const handleToggle = (moduleId: string, action: string, checked: boolean) => {
        setData((prev) => {
            const current = prev.permissions[moduleId] || [];
            const updated = checked ? Array.from(new Set([...current, action])) : current.filter((a) => a !== action);

            return {
                ...prev,
                permissions: {
                    ...prev.permissions,
                    [moduleId]: updated,
                },
            };
        });
    };

    const defaultPermissions: Record<string, string[]> = role.permissions ?? {};

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm<ManageRoleForm>({
        name: role.name,
        description: role.description,
        for_admin: role.for_admin,
        roleId: role.id,
        permissions: defaultPermissions,
    });

    const handleSubmit = () => {
        const promise = new Promise<void>((resolve, reject) => {
            post(route('roles.update-permissions'), {
                preserveScroll: true,
                onSuccess: (page) => {
                    const flash = (page.props as { flash?: SharedData['flash'] }).flash;

                    if (flash?.error) {
                        reject(flash.error);
                    } else {
                        resolve();
                    }
                },
                onError: () => {
                    reject('Failed to update role permissions.');
                },
            });
        });

        toast.promise(promise, {
            loading: 'Updating role permissions...',
            success: 'Role permissions updated successfully!',
            error: (message) => message,
            duration: 5000,
            description: formatDateFull(new Date()),
            descriptionClassName: '!text-gray-500',
            classNames: {
                success: '!text-green-700',
                error: '!text-red-700',
                loading: '!text-blue-700',
            },
        });
    };

    const generateModuleFields = (modules: Module[], indentLevel = 0): Field[] => {
        return modules.flatMap((mod) => {
            const actions = mod.available_actions ?? [];
            const modulePermissions = data.permissions[mod.id] ?? [];

            const field: Field = {
                label: (
                    <div className="flex flex-col">
                        <span className="font-medium">{mod.name}</span>
                        <span className="text-xs text-gray-600">{mod.group_title}</span>
                    </div>
                ),
                description: mod.description,
                name: `permissions-${mod.id}`,
                render: (
                    <div className="flex gap-5">
                        {actions.map((action) => {
                            const checkboxId = `${mod.id}-${action}`;
                            const isChecked = modulePermissions.includes(action);
                            return (
                                <div key={checkboxId} className="flex items-center gap-2">
                                    <Switch
                                        id={checkboxId}
                                        checked={isChecked}
                                        onCheckedChange={(checked) => {
                                            handleToggle(mod.id, action, !!checked);
                                        }}
                                        disabled={
                                            !data.for_admin ||
                                            (isChecked &&
                                                action === 'can_view' &&
                                                auth.permissions?.[mod.name]?.can_view !== 1 &&
                                                currentUserRoles.some((r) => r.id === role.id))
                                        }
                                    />
                                    <label htmlFor={checkboxId} className="text-sm font-medium">
                                        {action.replace('can_', '').replace('_', ' ').toUpperCase()}
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                ),
            };

            const childrenFields = mod.children?.length ? generateModuleFields(mod.children, indentLevel + 1) : [];

            return [field, ...childrenFields];
        });
    };

    const fields: Field[] = [
        {
            label: 'Name',
            description: 'The name of the role. This will be displayed in the admin dashboard.',
            name: 'name',
            render: (
                <Input
                    type="text"
                    className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none"
                    defaultValue={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Name"
                    name="name"
                    autoComplete="name"
                />
            ),
            error: errors.name,
        },
        {
            label: 'Description',
            description: 'The description of the role. This will be displayed in the admin dashboard.',
            name: 'description',
            render: (
                <Input
                    type="text"
                    className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none"
                    defaultValue={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Description"
                    name="description"
                    autoComplete="description"
                />
            ),
            error: errors.description,
        },
        {
            label: 'Admin Access',
            description: 'Determines if the role can access the admin dashboard. If enabled, the role will have access to all modules and actions.',
            name: 'for_admin',
            render: (
                <Switch
                    id="for-admin"
                    checked={data.for_admin ? true : false}
                    onCheckedChange={(checked) => {
                        const isChecked = !!checked;
                        setData('for_admin', isChecked);
                    }}
                />
            ),
            error: errors.for_admin,
        },
        {
            header: 'Module Permissions',
            name: 'permissions-header',
            isHeader: true,
        },
        ...(data.for_admin
            ? generateModuleFields(modules)
            : [
                  {
                      header: <p className="text-sm font-medium text-gray-500">This role is not allowed to access the admin dashboard.</p>,
                      name: 'permissions-disabled',
                      isHeader: true,
                  },
              ]),
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Manage ${role.name} Role`} />
            <div className="px-4 py-6">
                <Heading title={data.name} description={data.description} />
                <ManageFormLayout
                    fields={fields}
                    onSubmit={handleSubmit}
                    showSuccess={recentlySuccessful}
                    isProcessing={processing}
                    saveLabel="Save Role"
                    modulePath="/roles"
                />
            </div>
        </AppLayout>
    );
}
