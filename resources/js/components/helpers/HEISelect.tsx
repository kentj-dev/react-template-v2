import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';

interface HEISelectProps {
    allHEI: string[];
    value: string;
    onChange: (hei: string) => void;
}

const HEISelect: React.FC<HEISelectProps> = ({ allHEI, value, onChange }) => {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild className="h-12.5 resize-none text-start break-all whitespace-pre-line md:h-auto">
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between border-b-1 active:border-b-1">
                    {value ? value : '— Select HEI —'}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0">
                <Command>
                    <CommandInput placeholder="Search HEI..." className="h-9" id="hei-select-input" />
                    <CommandList>
                        <CommandEmpty>No HEI found.</CommandEmpty>
                        <CommandGroup>
                            {allHEI.map((hei) => (
                                <CommandItem
                                    key={hei.trim()}
                                    value={hei.trim()}
                                    onSelect={() => {
                                        onChange(hei.trim());
                                        setOpen(false);
                                    }}
                                >
                                    {hei.trim()}
                                    <Check className={cn('ml-auto', value.trim() === hei.trim() ? 'opacity-100' : 'opacity-0')} />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default HEISelect;
