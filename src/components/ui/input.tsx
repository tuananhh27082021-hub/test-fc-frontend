import * as React from 'react';

import { cn } from '@/utils/cn';

export type InputProps = {
  startDecorator?: React.ReactNode;
  endDecorator?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, startDecorator, endDecorator, type, ...props }, ref) => {
    if (!startDecorator && !endDecorator) {
      return (
        <input
          type={type}
          className={cn(
            'flex h-14 w-full rounded-xl border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          ref={ref}
          {...props}
        />
      );
    }

    return (
      <div className="relative">
        {startDecorator && (
          <div className="absolute left-1.5 top-1/2 -translate-y-1/2">
            {startDecorator}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-14 w-full rounded-xl border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-base file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            startDecorator ? 'pl-8' : '',
            endDecorator ? 'pr-8' : '',
            className,
          )}
          ref={ref}
          {...props}
        />
        {endDecorator && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {endDecorator}
          </div>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };

export type TextareaProps =
  {} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full border border-input bg-background px-3 py-2 rounded-xl ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
