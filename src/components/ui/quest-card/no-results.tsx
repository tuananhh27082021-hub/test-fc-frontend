import { TrendingUp } from 'lucide-react';
import React, { memo } from 'react';

export const NoResults = memo(() => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <TrendingUp className="size-12 text-gray-400" />
      </div>
      <h3 className="mb-2 font-baloo-2 text-xl font-semibold text-gray-800">
        No results found
      </h3>
      <p className="mb-6 max-w-md font-baloo-2 text-gray-600">
        We couldn’t find any results. This may be because no data exists yet or your filters returned no matches.
      </p>
    </div>
  );
});

NoResults.displayName = 'NoResults';
