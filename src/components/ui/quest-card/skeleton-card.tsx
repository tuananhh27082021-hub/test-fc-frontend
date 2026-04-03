import React, { memo } from 'react';

export const LoadingSkeleton = memo(() => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse flex-col gap-4 rounded-lg border p-4"
        >
          <div className="flex items-center gap-2">
            <div className="size-[48px] rounded bg-gray-200" />
            <div className="h-4 flex-1 rounded bg-gray-200" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-3 rounded bg-gray-200" />
            <div className="h-3 rounded bg-gray-200" />
          </div>
          <div className="flex justify-between">
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="h-3 w-24 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
});

LoadingSkeleton.displayName = 'LoadingSkeleton';
