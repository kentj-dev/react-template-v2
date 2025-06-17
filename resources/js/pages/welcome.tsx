import AppLayoutTemplate from '@/layouts/app/app-header-layout';
import { SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
export default function Welcome() {
    const { isClientRoute } = usePage<SharedData>().props;
    
    return (
        <>
            <AppLayoutTemplate isClientRoute={isClientRoute}>
                <Head title="Welcome">
                    <link rel="preconnect" href="https://fonts.bunny.net" />
                    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
                </Head>
            </AppLayoutTemplate>
        </>
    );
}
