import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CircleX } from 'lucide-react';

interface ConfirmActionPopoverProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trigger: React.ReactNode;
    title: string;
    description: React.ReactNode;
    confirmLabel: string;
    confirmIcon?: React.ReactNode;
    onConfirm: () => void;
    cancelLabel?: string;
    processing?: boolean;
    popoverClassName?: string;
    modal?: boolean;
}

export function ConfirmActionPopover({
    open,
    onOpenChange,
    trigger,
    title,
    description,
    confirmLabel,
    confirmIcon,
    onConfirm,
    cancelLabel = 'Cancel',
    processing = false,
    popoverClassName = 'w-96',
    modal = false,
}: ConfirmActionPopoverProps) {
    return (
        <Popover open={open} onOpenChange={onOpenChange} modal={modal}>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <PopoverContent className={popoverClassName}>
                <div className="flex flex-col items-center gap-3 p-2">
                    <span className="text-xl font-semibold text-gray-800">{title}</span>
                    <div className="text-center text-sm text-gray-600">{description}</div>
                    <div className="mt-4 flex w-full justify-center gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={processing}>
                            <CircleX />
                            {cancelLabel}
                        </Button>
                        <Button variant={'success'} disabled={processing} onClick={onConfirm}>
                            {confirmIcon}
                            {confirmLabel}
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
