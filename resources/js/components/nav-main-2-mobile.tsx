import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { usePermissions } from '@/hooks/use-permissions';
import { getLucideIcon } from '@/lib/get-lucide-icon';
import { Auth, NavigationModule } from '@/types';
import { Link } from '@inertiajs/react';
import { ChevronsUpDown, Menu } from 'lucide-react';
import AppLogo from './app-logo';
import { Button } from './ui/button';
import { UserInfo } from './user-info';
import { UserMenuContent } from './user-menu-content';

interface NavMainVer2Props {
    auth: Auth;
    navigations: Record<string, NavigationModule[]>;
    isClientRoute: boolean;
    disabled?: boolean;
}

export function NavMainVer2Mobile({ auth, navigations, isClientRoute, disabled = false }: NavMainVer2Props) {
    const { canView } = usePermissions();

    const isModuleAccessible = (modulePath: string): boolean => {
        return canView(modulePath);
    };

    return (
        <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild disabled={disabled}>
                    <Button variant="ghost" size="icon" className="mr-2">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-sidebar flex h-full w-64 flex-col items-stretch justify-between" showClose={false}>
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <SheetDescription className="sr-only">Navigation Menu</SheetDescription>
                    <SheetHeader className="flex justify-start text-left">
                        <Link href="/" prefetch className="flex gap-2">
                            <AppLogo />
                        </Link>
                    </SheetHeader>
                    <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                        <div className="flex h-full flex-col justify-between text-sm">
                            <div className="flex flex-col space-y-4">
                                {Object.entries(navigations).map(([groupTitle, modules]) => {
                                    const accessibleItems = modules.filter((mod: NavigationModule) => isModuleAccessible(mod.path ?? mod.name));
                                    if (accessibleItems.length === 0) return null;
                                    return (
                                        <div key={groupTitle}>
                                            <div className="mb-1 px-1 pt-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                {groupTitle}
                                            </div>
                                            <div className="flex flex-col space-y-1">
                                                {accessibleItems.map((module) => {
                                                    const Icon = getLucideIcon(module.icon);
                                                    return (
                                                        <Link
                                                            key={module.id}
                                                            href={module.path ?? '#'}
                                                            className="flex items-center gap-2 rounded px-3 py-2 font-medium text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                                                        >
                                                            {Icon && <Icon size={18} className="h-4 w-4" />}
                                                            <span>{module.name}</span>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="relative mt-6 flex w-full items-center justify-between space-x-2">
                                {auth.user && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <div className="text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent group flex w-full items-center gap-2">
                                                <UserInfo user={auth.user} />
                                                <ChevronsUpDown className="ml-auto size-4" />
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                            align="end"
                                            side="bottom"
                                        >
                                            <UserMenuContent user={auth.user} />
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
