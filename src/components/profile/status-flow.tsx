'use client';

import { CustomCheckbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type StatusFlowProps = {
  options: Array<{ name: string; value: string }>;
  isAdjourn?: boolean;
  isChecked: (val: string) => boolean;
};

export const StatusFlow = ({
  options,
  isAdjourn,
  isChecked,
}: StatusFlowProps) => {
  return (
    <div className="relative flex items-center gap-6">
      {options.map(option => (
        <div
          key={option.value}
          className="flex w-full flex-col items-center gap-1"
        >
          <CustomCheckbox
            defaultChecked={isChecked(option.value)}
            id={option.value}
            className="pointer-events-none"
          />
          <Label htmlFor={option.value}>{option.name}</Label>
        </div>
      ))}

      {isAdjourn && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl border border-border bg-black/60 font-medium text-white backdrop-blur">
          Adjourn
        </div>
      )}
    </div>
  );
};
