import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-base font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
  {
    variants: {
      variant: {
        default: 'border border-border bg-secondary text-white',
        ghost: 'text-while focus-visible:none',
        outline: ['border-2 border-border bg-white'],
        // check
        noShadow: 'bg-main border-2 border-border',
        link: 'text-text underline-offset-4 hover:underline',
        highlight:
          'border border-border bg-white !shadow-highlight hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none',
        reverse:
          'bg-main border-2 border-border hover:translate-x-reverseBoxShadowX hover:translate-y-reverseBoxShadowY hover:shadow-light',
      },
      size: {
        default: 'h-12 px-7 py-3',
        sm: 'h-10 px-5 py-2',
        lg: 'h-14 px-6 py-3',
        icon: 'size-12 text-xl',
        ghost: '',
      },
      noShadow: {
        true: 'translate-x-boxShadowX translate-y-boxShadowY',
        false:
          'shadow-light hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      noShadow: false,
    },
  },
);

export type ButtonProps = {
  asChild?: boolean;
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
  loading?: boolean;
  startDecoratorClassName?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
VariantProps<typeof buttonVariants>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant,
      size,
      asChild = false,
      startDecorator,
      endDecorator,
      loading,
      disabled: disabledProp,
      noShadow = false,
      startDecoratorClassName,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';

    const disabled = disabledProp || loading;

    if (loading) {
      startDecorator = (
        <svg
          fill="currentColor"
          width="1em"
          height="1em"
          viewBox="0 0 16 16"
          xmlns="http://www.w3.org/2000/svg"
          className="animate-spin text-xl"
        >
          <g>
            <path d="M8,1V2.8A5.2,5.2,0,1,1,2.8,8H1A7,7,0,1,0,8,1Z" />
          </g>
        </svg>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, noShadow, className }))}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {startDecorator && (
          <span
            className={cn(
              'mr-3 inline-flex items-center shrink-0',
              startDecoratorClassName,
            )}
          >
            {startDecorator}
          </span>
        )}
        {children}
        {endDecorator && <span className="ml-2.5">{endDecorator}</span>}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
