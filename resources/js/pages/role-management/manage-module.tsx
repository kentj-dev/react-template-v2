import Heading from '@/components/heading';
import ManageFormLayout, { Field } from '@/components/helpers/ManageFormLayout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { permissionActions, usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { getLucideIcon } from '@/lib/get-lucide-icon';
import { cn } from '@/lib/utils';
import { SharedData, type BreadcrumbItem } from '@/types';
import { formatDateFull } from '@/utils/dateHelper';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type Role = {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    role_modules: {
        id: string;
        module_id: string;
    }[];
    for_admin: boolean;
};

type Module = {
    id: string;
    name: string;
    icon: string;
    path: string | null;
    order: number;
    is_client: boolean;
    group_title: string;
    description: string;
    created_at: string;
    updated_at: string;
    parent_id: string | null;
    available_actions: string[];
    roles: {
        id: string;
    }[];
};

interface ManageModuleProps {
    module: Module;
    modules: Module[];
    roles: Role[];
}

type ManageModuleForm = {
    icon: string;
    order: number;
    name: string;
    description: string;
    parent_id: string | null;
    path: string | null;
    is_client: boolean;
    group_title: string;
    available_actions: string[];
    moduleId: string;
    rolesId: string[];
};

export default function ManageModule({ module, modules, roles }: ManageModuleProps) {
    const { canUpdate } = usePermissions();

    const { auth } = usePage<SharedData>().props;
    const currentUserRoles = auth.user.roles;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Modules',
            href: '/modules',
        },
        {
            title: module.name,
            href: `/modules/view/${module.id}`,
        },
    ];

    const handleToggle = (roleId: string, checked: boolean) => {
        setData((prev) => {
            const updated = checked ? [...prev.rolesId, roleId] : prev.rolesId.filter((id) => id !== roleId);

            return { ...prev, rolesId: updated };
        });
    };

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm<Required<ManageModuleForm>>({
        icon: module.icon,
        order: module.order,
        name: module.name,
        description: module.description,
        parent_id: module.parent_id ? module.parent_id : null,
        path: module.path,
        is_client: module.is_client,
        group_title: module.group_title,
        available_actions: module.available_actions,
        moduleId: module.id,
        rolesId: module.roles.map((role) => role.id),
    });

    const handleSubmit = () => {
        const promise = new Promise<void>((resolve, reject) => {
            post(route('modules.update-permissions'), {
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
                    reject('Failed to update module permissions');
                },
            });
        });

        toast.promise(promise, {
            loading: 'Updating module permissions...',
            success: 'Module updated successfully!',
            error: (message) => message,
            description: formatDateFull(new Date()),
            descriptionClassName: '!text-gray-500',
            duration: 5000,
            classNames: {
                success: '!text-green-700',
                error: '!text-red-700',
                loading: '!text-blue-700',
            },
            position: 'bottom-right',
        });
    };

    const [openParentModule, setOpenParentModule] = useState(false);
    const [parentModuleValue, setParentModuleValue] = useState(data.parent_id ?? '');

    const [roleSearch, setRoleSearch] = useState('');

    const Icon = getLucideIcon(data.icon);

    const fields: Field[] = [
        {
            label: 'Name',
            description: 'Name of the module in the navigation bar. This is used to display the name of the module in the navigation bar.',
            name: 'name',
            render: (
                <Input
                    type="text"
                    className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none disabled:opacity-100"
                    defaultValue={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Name"
                    name="name"
                    autoComplete="name"
                    disabled={!canUpdate('/modules')}
                />
            ),
            error: errors.name,
        },
        {
            label: 'Description',
            description: 'Description of the module.',
            name: 'description',
            render: (
                <Input
                    type="text"
                    className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none disabled:opacity-100"
                    defaultValue={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Description"
                    name="description"
                    autoComplete="description"
                    disabled={!canUpdate('/modules')}
                />
            ),
            error: errors.description,
        },
        {
            label: 'Icon',
            description: (
                <span className="text-xs text-gray-500">
                    <span>Icon of the module in the navigation bar. This is used to display the icon of the module in the navigation bar.</span>
                    <a href="https://lucide.dev/icons/" className="ml-1" target="_blank" rel="noopener noreferrer">
                        <span className="text-blue-500 underline">Click here</span>
                    </a>
                    <span className="ml-1">to see the available icons.</span>
                </span>
            ),
            name: 'icon',
            render: (
                <div className="flex items-center gap-2">
                    <Input value={data.icon} onChange={(e) => setData('icon', e.target.value)} disabled={!canUpdate('/modules')} />
                    {Icon && <Icon size={16} />}
                </div>
            ),
            error: errors.icon,
        },
        {
            label: 'Order',
            description: 'Order of the module in the navigation bar.',
            name: 'order',
            render: (
                <Input
                    type="number"
                    className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none disabled:opacity-100"
                    defaultValue={data.order}
                    onChange={(e) => setData('order', parseInt(e.target.value))}
                    placeholder="Order"
                    name="order"
                    autoComplete="order"
                    disabled={!canUpdate('/modules')}
                />
            ),
            error: errors.order,
        },
        {
            label: 'Parent Module',
            description: 'Parent module of the module in the navigation bar. This is used to group the modules in the navigation bar.',
            name: 'parent_id',
            render: (
                <Popover open={openParentModule} onOpenChange={setOpenParentModule}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openParentModule}
                            className="w-full justify-between rounded-sm disabled:opacity-100 md:w-[215px]"
                            disabled={!canUpdate('/modules')}
                        >
                            {parentModuleValue ? modules.find((m) => m.id === parentModuleValue)?.name : 'Select parent module...'}
                            <ChevronsUpDown className="opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[215px] p-0">
                        <Command>
                            <CommandInput placeholder="Search framework..." className="h-9" />
                            <CommandList>
                                <CommandEmpty>No framework found.</CommandEmpty>
                                <CommandGroup>
                                    <CommandItem
                                        value=""
                                        onSelect={() => {
                                            setParentModuleValue('');
                                            setData('parent_id', null);
                                            setOpenParentModule(false);
                                        }}
                                    >
                                        <span className="text-sm font-medium text-red-700">No Parent Module</span>
                                        <Check className={cn('ml-auto', parentModuleValue === '' ? 'opacity-100' : 'opacity-0')} />
                                    </CommandItem>
                                    {modules.map((mod) => (
                                        <CommandItem
                                            key={mod.id}
                                            value={mod.id}
                                            onSelect={(currentValue) => {
                                                const selected = currentValue === parentModuleValue ? '' : currentValue;
                                                setParentModuleValue(selected);
                                                setData('parent_id', selected || null);
                                                setOpenParentModule(false);
                                            }}
                                        >
                                            {mod.name}
                                            <Check className={cn('ml-auto', parentModuleValue === mod.id ? 'opacity-100' : 'opacity-0')} />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            ),
            error: errors.parent_id,
        },
        {
            label: 'Path',
            description: 'Path of the module in the navigation bar. This is used to generate the URL for the module.',
            name: 'path',
            render: (
                <Input
                    type="text"
                    className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none disabled:opacity-100"
                    defaultValue={data.path ?? ''}
                    onChange={(e) => setData('path', e.target.value)}
                    placeholder="Path"
                    name="path"
                    autoComplete="path"
                    disabled={!canUpdate('/modules')}
                />
            ),
            error: errors.path,
        },
        {
            label: 'Client Route',
            description: 'Determine if the module is a client route or not. This is used to generate the URL for the module in the client side.',
            name: 'is_client',
            render: (
                <Switch
                    id="is_client-mode"
                    checked={data.is_client}
                    onCheckedChange={(checked) => setData('is_client', !!checked)}
                    disabled={!canUpdate('/modules')}
                />
            ),
            error: errors.is_client,
        },
        {
            label: 'Group Title',
            description: 'Group title of the module in the navigation bar. This is used to group the modules in the navigation bar.',
            name: 'group_title',
            render: (
                <Input
                    type="text"
                    className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none disabled:opacity-100"
                    defaultValue={data.group_title}
                    onChange={(e) => setData('group_title', e.target.value)}
                    placeholder="Group Title"
                    name="group_title"
                    autoComplete="group_title"
                    disabled={!canUpdate('/modules')}
                />
            ),
            error: errors.group_title,
        },
        {
            label: 'Roles',
            description: 'The roles that have access to this module.',
            name: 'rolesId',
            render: (
                <div>
                    <input
                        name="role-search"
                        type="text"
                        placeholder="Search for role"
                        className="border-b text-xs focus:outline-none disabled:opacity-100"
                        value={roleSearch}
                        onChange={(e) => setRoleSearch(e.target.value)}
                        disabled={!canUpdate('/modules')}
                    />
                    <ScrollArea className="flex max-h-52 w-48 flex-col gap-2 rounded p-2" id="roles">
                        {roles.filter((role) => role.name.toLowerCase().includes(roleSearch.toLowerCase())).length > 0 ? (
                            roles
                                .filter((role) => role.name.toLowerCase().includes(roleSearch.toLowerCase()))
                                .map((role) => (
                                    <div key={role.id} className="mb-1 flex items-center gap-2 text-sm font-medium">
                                        <Checkbox
                                            id={role.id}
                                            checked={data.rolesId.includes(role.id)}
                                            onCheckedChange={(checked) => handleToggle(role.id, !!checked)}
                                            disabled={!role.for_admin || !canUpdate('/modules') || currentUserRoles.some((r) => r.id === role.id)}
                                        />
                                        <label
                                            htmlFor={role.id}
                                            className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {role.name}
                                        </label>
                                    </div>
                                ))
                        ) : (
                            <p className="text-muted-foreground text-xs italic">No role found.</p>
                        )}
                    </ScrollArea>
                </div>
            ),
            error: errors.rolesId,
        },
        {
            label: 'Available Actions',
            description: 'The actions that are available for this module.',
            name: 'available_actions',
            render: (
                <div className="flex flex-col gap-2">
                    {permissionActions.map((action) => {
                        const checkboxId = `action-${action}`;
                        const isChecked = data.available_actions.includes(action);

                        return (
                            <div key={checkboxId} className="flex items-center gap-2 text-sm font-medium">
                                <Checkbox
                                    id={checkboxId}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                        const updatedActions = checked
                                            ? [...data.available_actions, action]
                                            : data.available_actions.filter((a) => a !== action);
                                        setData('available_actions', updatedActions);
                                    }}
                                    disabled={!canUpdate('/modules')}
                                />
                                <label htmlFor={checkboxId} className="text-sm leading-none font-medium">
                                    {action.replace('can_', '').replace('_', ' ').toUpperCase()}
                                </label>
                            </div>
                        );
                    })}
                </div>
            ),
            error: errors.available_actions,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Manage ${module.name} Module`} />
            <div className="px-4 py-6">
                <Heading title={data.name} description={data.description} />
                <ManageFormLayout
                    fields={fields}
                    onSubmit={handleSubmit}
                    showSuccess={recentlySuccessful}
                    isProcessing={processing}
                    saveLabel="Save Module"
                    modulePath="/modules"
                />
            </div>
        </AppLayout>
    );
}
