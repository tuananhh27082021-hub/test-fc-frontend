import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-xl border px-2 py-0.5 font-medium leading-normal transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        filled: '',
        outline: 'border',
      },
      color: {
        default: '',
        good: '',
        white: '',
        alert: '',
      },
    },
    compoundVariants: [
      {
        variant: ['filled'],
        color: 'default',
        className: 'bg-[#D8D8D8] text-[#777777]',
      },
      {
        variant: ['filled'],
        color: 'good',
        className: 'bg-good text-foreground',
      },
      {
        variant: ['filled'],
        color: 'alert',
        className: 'border-alert bg-alert text-foreground',
      },
      {
        variant: ['outline'],
        color: 'default',
        className: 'border-border text-foreground',
      },
      {
        variant: ['outline'],
        color: 'white',
        className: 'border-white text-white',
      },
    ],
    defaultVariants: {
      variant: 'filled',
      color: 'default',
    },
  },
);

export type BadgeProps = {} & Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'color'
> &
VariantProps<typeof badgeVariants>;

function Badge({ className, variant, color, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, color }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
