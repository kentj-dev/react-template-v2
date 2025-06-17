import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import React from 'react';
import AppLogoIcon from './app-logo-icon';

function AppLogoComponent({ companyClassName, appnameClassName }: { companyClassName?: string; appnameClassName?: string }) {
    const page = usePage<SharedData>();
    const { appCompany, appName } = page.props;

    return (
        <>
            <div>
                <AppLogoIcon />
            </div>
            <div className="grid flex-1 gap-0.5 text-left text-sm">
                <span className={`truncate font-bold ${companyClassName}`}>{appCompany}</span>
                <span className={`truncate font-semibold ${appnameClassName}`}>{appName}</span>
            </div>
        </>
    );
}

const AppLogo = React.memo(AppLogoComponent);
export default AppLogo;
