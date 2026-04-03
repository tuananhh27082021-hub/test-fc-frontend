import React from 'react';

import { cn } from '@/utils/cn';

export type ButtonProps = {
  active?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const TabButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, active = false, ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex px-8 py-4 gap-2.5 items-center justify-center font-semibold leading-none rounded-b-2xl disabled:bg-gray-500',
          { 'bg-white hover:bg-white/90 text-foreground shadow-light': active },
          { 'bg-transparent text-white border border-white': !active },
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

export default TabButton;
