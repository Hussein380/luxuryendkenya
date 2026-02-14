import * as React from 'react';
import { Check, ChevronsUpDown, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { getLocations } from '@/services/carService';

interface LocationAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function LocationAutocomplete({
    value,
    onChange,
    placeholder = 'Select location...',
    className,
}: LocationAutocompleteProps) {
    const [open, setOpen] = React.useState(false);
    const [locations, setLocations] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        const loadLocations = async () => {
            setLoading(true);
            try {
                const locs = await getLocations();
                setLocations(locs || []);
            } catch (err) {
                console.error('Failed to load locations:', err);
            } finally {
                setLoading(false);
            }
        };
        loadLocations();
    }, []);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn('w-full justify-between font-normal', className)}
                    disabled={loading}
                >
                    <div className="flex items-center gap-2 overflow-hidden">
                        <MapPin className="h-4 w-4 shrink-0 opacity-50" />
                        <span className="truncate">
                            {value ? value : placeholder}
                        </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search location..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>No location found.</CommandEmpty>
                        <CommandGroup>
                            {locations.map((location) => (
                                <CommandItem
                                    key={location}
                                    value={location}
                                    onSelect={(currentValue) => {
                                        // cmdk returns lowercase value by default, so we use the original location string
                                        onChange(currentValue === value.toLowerCase() ? "" : location);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            value === location ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                    {location}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
