'use client';

import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as React from 'react';

import { cn } from '@/utils/cn';

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    variant?: 'default' | 'success' | 'danger' | 'pink' | 'lime';
    size?: 'sm' | 'md' | 'lg';
    bordered?: boolean;
  }
>(
  (
    {
      className,
      variant = 'default',
      size = 'sm',
      bordered = false,
      value,
      ...props
    },
    ref,
  ) => (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-[#F2F2F2]',
        { 'h-1': size === 'sm' },
        { 'h-2': size === 'md' },
        { 'h-3': size === 'lg' },
        { 'border border-black rounded-[2px]': bordered },
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn('h-full w-full flex-1 transition-all', {
          'bg-[#777777]': variant === 'default',
          'bg-good': variant === 'success',
          'bg-danger': variant === 'danger',
          'bg-[#FE6CB3]': variant === 'pink',
          'bg-[#CDDD00]': variant === 'lime',
        })}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  ),
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
