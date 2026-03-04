import type { UseQueryResult } from '@tanstack/react-query';
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DataSelectOption<T = unknown> {
  value: string | number;
  label: string;
  data?: T;
}

interface DataSelectProps<TQuery = unknown, TMapped = TQuery> {
  /** Optional id for external label association */
  id?: string;
  /** Placeholder text when no value is selected */
  placeholder?: string;
  /** Currently selected value */
  value?: string | number;
  /** Callback when selection changes */
  onChange: (value: string | number | undefined, option?: DataSelectOption<TMapped>) => void;
  /** TanStack Query result containing the data */
  query: UseQueryResult<TQuery[], Error>;
  /** Function to map query data to select options (optional if valueKey/labelKey provided) */
  mapToOptions?: (data: TQuery[]) => DataSelectOption<TMapped>[];
  /** Key to use as value from data objects (default: 'id') */
  valueKey?: string;
  /** Key to use as label from data objects (default: 'name') */
  labelKey?: string;
  /** Auto-select if only one option available */
  oneBlocked?: boolean;
  /** Message to show when no options are available */
  noOptionsMessage?: string;
  /** Message to show when search returns no results */
  noResultsMessage?: string;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Whether the select can be cleared */
  clearable?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Search placeholder text */
  searchPlaceholder?: string;
}

export function DataSelect<TQuery = unknown, TMapped = TQuery>({
  id,
  placeholder = 'Select option...',
  value,
  onChange,
  query,
  mapToOptions,
  valueKey = 'id',
  labelKey = 'name',
  oneBlocked = false,
  noOptionsMessage = 'No options available.',
  noResultsMessage = 'No results found.',
  disabled = false,
  clearable = false,
  className,
  searchPlaceholder = 'Search...',
}: DataSelectProps<TQuery, TMapped>) {
  const [open, setOpen] = useState(false);

  const { data, isLoading, isError } = query;

  // Auto-map if mapToOptions not provided
  const options = data
    ? mapToOptions
      ? mapToOptions(data)
      : (data as any[]).map((item) => ({
          value: item[valueKey],
          label: item[labelKey],
          data: item,
        }))
    : [];

  const selectedOption = options.find((opt) => opt.value === value);

  // Auto-select when oneBlocked and only 1 option
  useEffect(() => {
    if (oneBlocked && options.length === 1 && !value) {
      onChange(options[0].value, options[0]);
    }
  }, [oneBlocked, options, value, onChange]);

  const handleSelect = (selectedValue: string) => {
    const option = options.find((opt) => String(opt.value) === selectedValue);
    if (option) {
      if (value === option.value && clearable) {
        onChange(undefined, undefined);
      } else {
        onChange(option.value, option);
      }
    }
    setOpen(false);
  };

  const isDisabled = disabled || (oneBlocked && options.length === 1);

  return (
    <div className={cn('w-full', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={isDisabled || isLoading}
            className={cn('w-full justify-between', !selectedOption && 'text-muted-foreground')}
          >
            <span className="truncate">{isLoading ? 'Loading...' : selectedOption ? selectedOption.label : placeholder}</span>
            <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 text-muted-foreground/80" aria-hidden="true" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              {isError ? (
                <CommandEmpty>Error loading options.</CommandEmpty>
              ) : options.length === 0 ? (
                <CommandEmpty>{noOptionsMessage}</CommandEmpty>
              ) : (
                <>
                  <CommandEmpty>{noResultsMessage}</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem key={String(option.value)} value={String(option.value)} onSelect={handleSelect}>
                        <span className="truncate">{option.label}</span>
                        {value === option.value && <CheckIcon size={16} className="ml-auto" />}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
