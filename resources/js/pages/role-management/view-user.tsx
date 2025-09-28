import Heading from '@/components/heading';
import CropDialog from '@/components/helpers/CropDialog';
import ManageFormLayout, { Field } from '@/components/helpers/ManageFormLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useInitials } from '@/hooks/use-initials';
import { usePermissions } from '@/hooks/use-permissions';
import AppLayout from '@/layouts/app-layout';
import { SharedData, User, type BreadcrumbItem } from '@/types';
import { formatDateFull } from '@/utils/dateHelper';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Role {
    id: string;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    users: User[];
    pivot: {
        user_id: string;
        role_id: string;
    };
}

interface ViewUserProps {
    user: User;
    roles: Role[];
}

type UpdateUserForm = {
    name: string;
    new_avatar: File | null;
    email: string;
    rolesId: string[];
};

const ViewUser: React.FC<ViewUserProps> = ({ user, roles }) => {
    const { canUpdate } = usePermissions();

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Users',
            href: '/users',
        },
        {
            title: user.name,
            href: `/view-user/${user.id}`,
        },
    ];

    const getInitials = useInitials();

    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [showCropModal, setShowCropModal] = useState(false);

    const [roleSearch, setRoleSearch] = useState('');

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setImageSrc(reader.result as string);
            setShowCropModal(true);
        };
        reader.readAsDataURL(file);
    };

    const handleCropped = (file: File) => {
        setData('new_avatar', file);
    };

    const { data, setData, errors, post, processing, recentlySuccessful, reset } = useForm<Required<UpdateUserForm>>({
        name: user.name,
        new_avatar: null,
        email: user.email,
        rolesId: user.roles.map((role) => role.id),
    });

    const updateUser = () => {
        const promise = new Promise<void>((resolve, reject) => {
            post(route('users.update-user', user.id), {
                preserveScroll: true,
                onSuccess: (page) => {
                    const flash = (page.props as { flash?: SharedData['flash'] }).flash;

                    reset('new_avatar');

                    if (flash?.error) {
                        reject(flash.error);
                    } else {
                        resolve();
                    }
                },
                onError: () => {
                    reject('Failed to update user.');
                },
            });
        });

        toast.promise(promise, {
            loading: 'Updating user...',
            success: 'User updated successfuly!',
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

    const handleToggle = (roleId: string, checked: boolean) => {
        setData((prev) => {
            const rolesId = checked ? [...prev.rolesId, roleId] : prev.rolesId.filter((id) => id !== roleId);
            return { ...prev, rolesId };
        });
    };

    const fields: Field[] = [
        {
            label: 'Name',
            description: 'The name of the user. This is the name that will be displayed on the user profile.',
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
            label: 'Email',
            description: 'The email of the user. This is the email that will be used to login to the user profile.',
            name: 'email',
            render: (
                <Input
                    type="email"
                    id="email"
                    name="email"
                    value={data.email}
                    placeholder="Email"
                    required
                    onChange={(e) => setData('email', e.target.value)}
                    disabled={!canUpdate('/users')}
                    className="disabled:opacity-100"
                    autoComplete="email"
                />
            ),
            error: errors.email,
        },
        {
            label: 'Current Avatar',
            description: 'The current avatar of the user.',
            name: 'current-avatar',
            render: (
                <Avatar className="size-20 rounded-md">
                    {user.avatar ? (
                        <AvatarImage src={`/storage/${user.avatar}`} alt={user.name} className="object-cover" />
                    ) : (
                        <AvatarFallback className="rounded-md">{getInitials(user.name)}</AvatarFallback>
                    )}
                </Avatar>
            ),
        },
        {
            label: 'New Avatar',
            description: 'The new avatar of the user. This is the image that will be displayed on the user profile.',
            name: 'new-avatar',
            render: (
                <Input
                    type="file"
                    id="avatar"
                    name="avatar"
                    accept="image/*"
                    onChange={onFileChange}
                    disabled={!canUpdate('/users')}
                    className="disabled:opacity-100"
                />
            ),
            error: errors.new_avatar,
        },
        {
            label: 'Password Reset',
            description: 'The password reset link of the user. This is the link that will be used to reset the password of the user.',
            name: 'password-reset',
            render: (
                <button
                    className="cursor-pointer text-sm text-blue-500"
                    onClick={(e) => {
                        e.preventDefault();
                        const promise = new Promise<void>((resolve, reject) => {
                            router.post(
                                route('password.email'),
                                { email: user.email },
                                { preserveScroll: true, onSuccess: () => resolve(), onError: () => reject() },
                            );
                        });

                        toast.promise(promise, {
                            loading: 'Sending password reset link...',
                            success: 'Password reset link sent!',
                            error: 'Failed to send password reset link.',
                            duration: 5000,
                        });
                    }}
                >
                    Send password reset link
                </button>
            ),
        },
        {
            label: 'Roles',
            description:
                'The roles of the user. This is the list of roles that the user has. The user will have access to the modules that are assigned to the roles.',
            name: 'roles',
            render: (
                <div className="flex flex-col gap-2">
                    <input
                        name="role-search"
                        type="text"
                        placeholder="Search for role"
                        className="border-b text-xs focus:outline-none disabled:opacity-100"
                        value={roleSearch}
                        onChange={(e) => setRoleSearch(e.target.value)}
                        disabled={!canUpdate('/users')}
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
                                            disabled={!canUpdate('/users')}
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
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={user.name} />
            <div className="px-4 py-6">
                <Heading title={user.name} description={user.email} />
                <ManageFormLayout
                    fields={fields}
                    onSubmit={updateUser}
                    showSuccess={recentlySuccessful}
                    isProcessing={processing}
                    saveLabel="Save User"
                    modulePath="/users"
                />
            </div>
            {imageSrc && <CropDialog imageSrc={imageSrc} open={showCropModal} onClose={() => setShowCropModal(false)} onCropped={handleCropped} />}
        </AppLayout>
    );
};

export default ViewUser;
