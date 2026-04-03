'use client';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import * as React from 'react';

import { cn } from '@/utils/cn';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    indicatorClassName?: string;
  }
>(({ className, indicatorClassName, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-6 w-6 shrink-0 rounded-md border border-foreground-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      'data-[state=checked]:border-foreground data-[state=checked]:text-primary',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn('flex items-center justify-center text-current')}
    >
      <span
        className={cn('size-[14px] rounded-sm bg-primary', indicatorClassName)}
      />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

const CustomCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    // className={cn(
    //   "peer h-6 w-6 shrink-0 rounded-md border border-foreground-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
    //   "data-[state=checked]:border-foreground data-[state=checked]:text-primary",
    //   className
    // )}
    className={cn(
      'aspect-square h-5 w-5 flex items-center justify-center rounded-full border border-border text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      'bg-[#777777] data-[state=checked]:bg-primary',
      className,
    )}
    {...props}
  >
    <div className="size-3 rounded-full border border-border bg-white" />
    {/* <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <span className="size-[14px] rounded-sm bg-primary" />
    </CheckboxPrimitive.Indicator> */}
  </CheckboxPrimitive.Root>
));

CustomCheckbox.displayName = 'CustomCheckbox';

export { Checkbox, CustomCheckbox };
