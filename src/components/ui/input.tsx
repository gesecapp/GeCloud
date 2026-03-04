import type * as React from 'react';

import { cn } from '@/lib/utils';

function Input({
  className,
  type,
  size = 'default',
  ...props
}: Omit<React.ComponentProps<'input'>, 'size'> & {
  size?: 'sm' | 'default';
}) {
  return (
    <input
      type={type}
      data-slot="input"
      data-size={size}
      className={cn(
        'w-full min-w-0 rounded-md px-4 py-2',
        'font-medium text-sm',
        'border border-input bg-background text-foreground',
        'dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
        'selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground',
        'hover:bg-accent hover:text-accent-foreground',

        'outline-none transition-all',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',

        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm',
        'data-[size=default]:h-11 data-[size=sm]:h-8 data-[size=sm]:px-2',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
