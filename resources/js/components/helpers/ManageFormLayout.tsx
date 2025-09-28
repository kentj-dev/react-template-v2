import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/use-permissions';
import { Transition } from '@headlessui/react';
import { JSX } from 'react';

export interface Field {
    label?: JSX.Element | string;
    header?: JSX.Element | string;
    description?: JSX.Element | string;
    name: string;
    render?: JSX.Element;
    error?: string;
    isHeader?: boolean;
}

interface ManageFormLayoutProps {
    fields: Field[];
    onSubmit: () => void;
    showSuccess?: boolean;
    isProcessing: boolean;
    saveLabel?: string;
    modulePath: string;
}

export default function ManageFormLayout({
    fields,
    onSubmit,
    showSuccess = false,
    isProcessing,
    saveLabel = 'Save Changes',
    modulePath,
}: ManageFormLayoutProps) {
    const { canUpdate } = usePermissions();

    return (
        <div className="flex flex-col">
            {fields.map((field, i) => (
                <div key={field.name}>
                    {!field.isHeader ? (
                        <div
                            className={`flex flex-col items-stretch gap-0 ${i === fields.length - 1 ? 'border-b' : ''} border-t text-sm font-medium md:flex-row md:gap-3`}
                        >
                            <div className="flex w-auto flex-col gap-0 border-0 py-3 pr-3 md:w-100 md:border-r">
                                {field.label && (typeof field.label === 'string' ? <span>{field.label}</span> : field.label)}
                                {field.description &&
                                    (typeof field.description === 'string' ? (
                                        <span className="text-muted-foreground text-xs">{field.description}</span>
                                    ) : (
                                        field.description
                                    ))}
                                {field.error && <InputError message={field.error} className="mt-2 text-xs" />}
                            </div>
                            <div className="my-auto overflow-auto pb-3 md:py-3">{field.render}</div>
                        </div>
                    ) : (
                        field.header &&
                        (typeof field.header === 'string' ? <span className="flex border-t py-2 font-semibold">{field.header}</span> : field.header)
                    )}
                </div>
            ))}
            {canUpdate(modulePath) && (
                <div className="mt-4 flex items-center gap-2">
                    <Button type="button" onClick={onSubmit} disabled={isProcessing}>
                        {saveLabel}
                    </Button>
                    <Transition
                        show={showSuccess}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-neutral-600">Saved</p>
                    </Transition>
                </div>
            )}
        </div>
    );
}
