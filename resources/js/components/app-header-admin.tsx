import { Breadcrumbs } from '@/components/breadcrumbs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { BreadcrumbItem, SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import useScrollPosition from '@react-hook/window-scroll';
import { Image } from '@unpic/react';
import { AnimatePresence, motion } from 'framer-motion';
import AppLogo from './app-logo';
import { NavMainVer2 } from './nav-main-2';
import { NavMainVer2Mobile } from './nav-main-2-mobile';
import { UserMenuContent } from './user-menu-content';
import { HEADER_COLOR } from './app-header';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeaderAdmin({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();

    const { auth, isClientRoute, navigations } = page.props;

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
                                                    <UserMenuContent user={auth.user} />
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
            {isMobile && <NavMainVer2Mobile auth={auth} navigations={navigations} isClientRoute={isClientRoute} />}

            {!isMobile && (
                <div className="border-sidebar-border/80 sticky top-0 z-50 border-b pb-2 md:pb-0">
                    <div className="dark:bg-background mx-auto w-full bg-white md:max-w-7xl">
                        <div className="ml-2 hidden items-center space-x-6 md:flex md:justify-between">
                            <NavMainVer2 navigations={navigations} />

                            <div className="flex items-center gap-2 pr-4">
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
                                <span className="text-xs text-gray-500">Admin Panel</span>
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
