import { Slot } from '@radix-ui/react-slot';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import React from 'react';

import { cn } from '@/utils/cn';

const typographyVariants = cva('leading-normal tracking-[0.1px]', {
  variants: {
    level: {
      h1: 'text-[48px] font-extrabold leading-[56px] tracking-[0.5px]',
      h2: 'text-[40px] font-extrabold leading-[48px] tracking-[0.2px]',
      h3: 'text-[32px] font-bold leading-[40px]',
      h4: 'text-[24px] font-bold leading-[32px]',
      h5: 'text-[20px] font-bold leading-[28px]',
      h6: 'text-base font-semibold leading-[24px]',
      body1: 'text-base leading-normal',
      body2: 'text-sm leading-[22px]',
      caption: 'text-xs',
    },
  },
  defaultVariants: {
    level: 'body1',
  },
});

const defaultVariantMapping: Record<
  NonNullable<VariantProps<typeof typographyVariants>['level']>,
  string
> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body1: 'p',
  body2: 'p',
  caption: 'span',
};

type Elemement =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'span'
  | 'b'
  | 'em'
  | 'div';

export type TypographyProps = {
  asChild?: boolean;
} & Omit<HTMLAttributes<Elemement>, 'color'> & VariantProps<typeof typographyVariants>;

export const Typography = React.forwardRef<Elemement, TypographyProps>(
  ({ className, level = 'body1', asChild = false, ...props }, ref) => {
    const Tag = asChild ? Slot : defaultVariantMapping[level ?? 'body1'];

    return (
      <Tag
        className={cn(typographyVariants({ className, level }))}
        // @ts-expect-error unknown error
        ref={ref}
        {...props}
      />
    );
  },
);
