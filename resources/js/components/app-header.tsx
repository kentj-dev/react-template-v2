import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ClientUserMenuContent } from '@/components/user-menu-content-client';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import useScrollPosition from '@react-hook/window-scroll';
import { Image } from '@unpic/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronsUpDown, KeyRound, Menu, ReceiptText } from 'lucide-react';
import AppLogo from './app-logo';
import { UserInfo } from './user-info';

const mainNavItems: NavItem[] = [
    {
        title: 'Module 1',
        href: '/',
        icon: ReceiptText,
        routes: ['/'],
    },
];

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export const HEADER_COLOR = 'bg-[#2A5298]';

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth, isClientRoute } = page.props;

    const scrollY = useScrollPosition(60);

    const isMobile = useIsMobile();

    return (
        <>
            <div className={`border-sidebar-border/80 ${HEADER_COLOR}`}>
                <div className="mx-auto flex flex-col gap-2 md:max-w-7xl">
                    <div className="flex items-center justify-between p-4 px-4">
                        <div className="flex w-full items-center justify-between">
                            <Link href="/" prefetch className="flex items-center space-x-3">
                                <AppLogo companyClassName="text-white text-[15px]" appnameClassName="text-gray-200 text-[12px]" />
                            </Link>

                            <div className="hidden items-center space-x-4 md:flex">
                                <div className="relative flex items-center space-x-2">
                                    {auth.user ? (
                                        <>
                                            <div className="mr-3 flex flex-col text-end">
                                                <span className="text-sm font-semibold text-gray-200">{auth.user.name}</span>
                                                <span className="text-xs text-gray-200">{auth.user.email}</span>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Image
                                                        layout="constrained"
                                                        width={40}
                                                        height={40}
                                                        src={`/storage/${auth.user.avatar}`}
                                                        alt={auth.user.name}
                                                        className="size-8 overflow-hidden rounded-md"
                                                    />
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-56" align="end">
                                                    <ClientUserMenuContent auth={auth} isClientRoute={isClientRoute} />
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href={route('login')}
                                                className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#EDEDEC] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                            >
                                                Log in
                                            </Link>
                                            {/* <Link
                                                href={route('register')}
                                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                            >
                                                Register
                                            </Link> */}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Mobile Menu */}
            {isMobile && (
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
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
                                        {mainNavItems.map((item) => (
                                            <Link key={item.title} href={item.href} className="flex items-center space-x-2 font-medium">
                                                {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                <span>{item.title}</span>
                                            </Link>
                                        ))}
                                    </div>
                                    <div className="relative flex w-full items-center justify-between space-x-2">
                                        {auth.user && (
                                            <>
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
                                                        <ClientUserMenuContent auth={auth} isClientRoute={isClientRoute} />
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {!auth.user && (
                                <div className="flex p-4 text-sm">
                                    <Link href={route('login')} className="flex items-center space-x-2 font-medium">
                                        <KeyRound className="h-5 w-5" />
                                        <span>Login</span>
                                    </Link>
                                </div>
                            )}
                        </SheetContent>
                    </Sheet>
                </div>
            )}
            {!isMobile && (
                <div className="border-sidebar-border/80 sticky top-0 z-50 border-b pb-2 md:pb-0">
                    <div className="dark:bg-background mx-auto w-full bg-white md:max-w-7xl">
                        <div className="ml-2 hidden items-center space-x-6 md:flex md:justify-between">
                            <NavigationMenu className="flex h-full items-stretch">
                                <NavigationMenuList className="relative flex h-full items-stretch space-x-2">
                                    {mainNavItems.map((item, index) => {
                                        const isActive = item.routes?.some((r) => (r === '/' ? page.url === '/' : page.url.startsWith(r)));
                                        return (
                                            <NavigationMenuItem key={index} className="relative flex h-full items-end">
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        navigationMenuTriggerStyle(),
                                                        'relative h-9 cursor-pointer px-3 dark:hover:bg-[#151515]',
                                                        isActive && 'text-[#3b5998] dark:bg-[#151515] dark:text-[#6393fa]',
                                                    )}
                                                >
                                                    {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                                                    {item.title}
                                                </Link>
                                                {isActive && (
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

                            <div className="pr-4">
                                <AnimatePresence>
                                    {scrollY > 150 && (
                                        <motion.button
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                            className="text-gray-500 focus:outline-none"
                                        >
                                            ↑
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {breadcrumbs.length > 1 && (
                <div className="border-sidebar-border/70 flex w-full border-b">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
