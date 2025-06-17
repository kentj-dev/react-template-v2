import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppHeaderAdmin } from '@/components/app-header-admin';
import { AppShell } from '@/components/app-shell';
import { type BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';

export default function AppHeaderLayout({
    children,
    breadcrumbs,
    isClientRoute,
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[]; isClientRoute: boolean }>) {
    return (
        <AppShell>
            {isClientRoute ? <AppHeader breadcrumbs={breadcrumbs} /> : <AppHeaderAdmin breadcrumbs={breadcrumbs} />}
            <AppContent>{children}</AppContent>
            <footer className="flex flex-col items-center justify-center gap-2 px-5 py-10 text-center text-xs text-gray-500 md:text-sm">
                <div>
                    <span className="font-semibold">Student Affairs Servicing</span>
                    <span className="mx-1">&bull;</span>
                    Empowering student services and compliance management
                </div>
                {/* <div className="flex flex-wrap items-center justify-center gap-1">
                    <span>Built with</span>
                    <span className="font-medium text-gray-600">&nbsp;Laravel,</span>
                    <span className="font-medium text-gray-600">&nbsp;Inertia.js,</span>
                    <span className="font-medium text-gray-600">&nbsp;React,</span>
                    <span>&nbsp;and&nbsp;</span>
                    <a href="https://ui.shadcn.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">
                        shadcn/ui
                    </a>
                </div> */}
                <div className="mt-1 text-xs text-gray-400">&copy; {new Date().getFullYear()} CHEDRO XII. All rights reserved.</div>
            </footer>
        </AppShell>
    );
}
