'use client';

import { Loader2Icon } from 'lucide-react';

import { cn } from '@/utils/cn';

export type ClaimButtonProps = {
  variant: 'claimable' | 'claimed' | 'adjourn' | 'unclaimable';
  disabled?: boolean;
  loading?: boolean;
  onClick: VoidFunction;
};

export const ClaimButton = ({
  variant,
  disabled,
  onClick,
  loading = false,
}: ClaimButtonProps) => {
  return (
    <div className="mr-2 flex items-center justify-center">
      {loading
        ? (
            <Loader2Icon className="size-6 animate-spin text-primary" />
          )
        : (
            <button
              className={cn(
                'inline-flex w-6 h-6 items-center justify-center whitespace-nowrap border rounded-md text-base font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:shadow-none',
                { 'border-[#D8D8D8]': variant === 'unclaimable' },
                { 'border-border': variant !== 'unclaimable' },
              )}
              disabled={disabled || variant !== 'claimable'}
              onClick={onClick}
            >
              <span
                className={cn('w-[14px] h-[14px] rounded-[4px]', {
                  'bg-black': variant === 'adjourn',
                  'bg-sup-orange': variant === 'claimed',
                  'bg-primary': variant === 'claimable',
                  'bg-[#D8D8D8]': variant === 'unclaimable',
                })}
              />
              <span className="sr-only">Reward</span>
            </button>
          )}
    </div>
  );
};
