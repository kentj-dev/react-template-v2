import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { usePermissions } from '@/hooks/use-permissions';
import { getLucideIcon } from '@/lib/get-lucide-icon';
import { cn, isRouteActive } from '@/lib/utils';
import { NavigationModule } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

interface NavMainVer2Props {
    navigations: Record<string, NavigationModule[]>;
}

export function NavMainVer2({ navigations }: NavMainVer2Props) {
    const page = usePage();

    const { canView } = usePermissions();

    const isModuleAccessible = (moduleName: string): boolean => {
        return canView(moduleName);
    };

    return (
        <NavigationMenu className="flex h-full w-full items-stretch" viewport={false}>
            <NavigationMenuList className="relative flex h-full items-stretch space-x-2">
                {Object.entries(navigations).map(([groupTitle, modules]) => {
                    const accessibleItems = modules.filter((mod: NavigationModule) => isModuleAccessible(mod.name));
                    if (accessibleItems.length === 0) return null;

                    const firstModule = accessibleItems[0];
                    const FirstIcon = getLucideIcon(firstModule.icon);
                    const isActiveGroup = accessibleItems.some((mod) => isRouteActive(page.url, mod.path));

                    if (accessibleItems.length === 1) {
                        return (
                            <NavigationMenuItem key={firstModule.id} className="relative flex h-full items-end">
                                <Link
                                    href={firstModule.path ?? '#'}
                                    className={cn(
                                        navigationMenuTriggerStyle(),
                                        'flex h-9 items-center gap-2 px-3 dark:hover:bg-[#151515]',
                                        isActiveGroup && 'font-semibold text-[#3b5998] dark:bg-[#151515] dark:text-[#6393fa]',
                                    )}
                                >
                                    {FirstIcon && <FirstIcon size={16} className="h-4 w-4" />}
                                    <span>{firstModule.name}</span>
                                </Link>
                                {isActiveGroup && (
                                    <motion.div
                                        layoutId="nav-underline"
                                        className="absolute bottom-0 left-0 z-50 h-[2px] w-full bg-[#3b5998] dark:bg-[#6393fa]"
                                        transition={{ type: 'spring', stiffness: 800, damping: 50 }}
                                    />
                                )}
                            </NavigationMenuItem>
                        );
                    }

                    return (
                        <NavigationMenuItem key={groupTitle} className="relative flex h-full items-end">
                            <NavigationMenuTrigger
                                className={cn(
                                    navigationMenuTriggerStyle(),
                                    'relative flex h-9 cursor-pointer items-center gap-2 px-3 dark:hover:bg-[#151515]',
                                    isActiveGroup && 'text-[#3b5998] dark:bg-[#151515] dark:text-[#6393fa]',
                                )}
                            >
                                {FirstIcon && <FirstIcon size={16} className="h-4 w-4" />}
                                <span>{groupTitle}</span>
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid min-w-[180px] gap-1">
                                    {accessibleItems.map((module) => {
                                        const Icon = getLucideIcon(module.icon);
                                        const isActive = isRouteActive(page.url, module.path);

                                        const children = module.children?.filter((child) => isModuleAccessible(child.name)) || [];

                                        if (children.length > 0) {
                                            return (
                                                <li key={module.id}>
                                                    <NavigationMenuLink asChild className="hover:bg-[#3b5998] hover:text-white">
                                                        <Link
                                                            href={module.path ?? '#'}
                                                            className={cn(
                                                                'flex flex-row items-center gap-2 rounded px-3 py-2 transition',
                                                                isActive && 'bg-[#3b5998] font-semibold text-white',
                                                            )}
                                                        >
                                                            {Icon && <Icon size={16} className="h-4 w-4 hover:text-white" />}
                                                            <span>{module.name}</span>
                                                        </Link>
                                                    </NavigationMenuLink>
                                                    {children.map((child) => {
                                                        const ChildIcon = getLucideIcon(child.icon);
                                                        const ChildIconIsActive = isRouteActive(page.url, child.path);

                                                        return (
                                                            <NavigationMenuLink asChild className="mt-1 hover:bg-[#3b5998] hover:text-white">
                                                                <Link
                                                                    href={child.path ?? '#'}
                                                                    className={cn(
                                                                        'flex flex-row items-center gap-2 rounded py-2 ps-8 pe-3 transition',
                                                                        ChildIconIsActive && 'bg-[#3b5998] font-semibold text-white',
                                                                    )}
                                                                >
                                                                    {ChildIcon && <ChildIcon size={16} className="h-4 w-4 hover:text-white" />}
                                                                    <span>{child.name}</span>
                                                                </Link>
                                                            </NavigationMenuLink>
                                                        );
                                                    })}
                                                </li>
                                            );
                                        }

                                        return (
                                            <li key={module.id}>
                                                <NavigationMenuLink asChild className="hover:bg-[#3b5998] hover:text-white">
                                                    <Link
                                                        href={module.path ?? '#'}
                                                        className={cn(
                                                            'flex flex-row items-center gap-2 rounded px-3 py-2 transition',
                                                            isActive && 'bg-[#3b5998] font-semibold text-white',
                                                        )}
                                                    >
                                                        {Icon && <Icon size={16} className="h-4 w-4 hover:text-white" />}
                                                        <span>{module.name}</span>
                                                    </Link>
                                                </NavigationMenuLink>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </NavigationMenuContent>
                            {isActiveGroup && (
                                <motion.div
                                    layoutId="nav-underline"
                                    className="absolute bottom-0 left-0 z-50 h-[2px] w-full bg-[#3b5998] dark:bg-[#6393fa]"
                                    transition={{ type: 'spring', stiffness: 800, damping: 50 }}
                                />
                            )}
                        </NavigationMenuItem>
                    );
                })}
            </NavigationMenuList>
        </NavigationMenu>
    );
}
