import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckIcon } from 'lucide-react';
import type * as React from 'react';

import { cn } from '@/lib/utils';

const checkboxVariants = cva(
  [
    'peer size-4 shrink-0 rounded-[4px]',
    'cursor-pointer border border-input',
    'bg-background text-foreground',
    'dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
    'hover:bg-accent',

    'outline-none transition-all',
    'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
    'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
    'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
  ],
  {
    variants: {
      variant: {
        default: 'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        blue: 'data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white',
        green: 'data-[state=checked]:border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

function Checkbox({ className, variant, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root> & VariantProps<typeof checkboxVariants>) {
  return (
    <CheckboxPrimitive.Root data-slot="checkbox" className={cn(checkboxVariants({ variant, className }))} {...props}>
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="grid place-content-center text-current transition-none">
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox, checkboxVariants };
