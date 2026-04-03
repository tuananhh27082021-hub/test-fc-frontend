'use client';

import { useState } from 'react';

import { InfoCircleIcon } from '@/components/ui/info-circle-icon';
import type { QuestDetail } from '@/types/schema';

export const MobileContextCard = ({ quest }: { quest: QuestDetail }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mt-5 rounded-xl border border-[#ECEAFC]">
      <div className="flex items-center justify-between rounded-t-xl bg-[rgba(59,39,223,0.1)] px-3 py-2">
        <div className="flex items-center gap-1">
          <InfoCircleIcon className="text-[#3B27DF]" />
          <span className="text-[13px] font-semibold">Additional context</span>
        </div>
        <button
          type="button"
          onClick={toggleExpanded}
          className="flex items-center justify-center rounded-md p-1 transition-colors hover:bg-[rgba(59,39,223,0.1)]"
        >
          <svg
            width="9"
            height="7"
            viewBox="0 0 9 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          >
            <path
              d="M4.01226 1.13135C4.34039 0.775878 4.91461 0.775879 5.24273 1.13135L8.74273 4.63135C8.98883 4.87744 9.07086 5.26025 8.93414 5.58838C8.79742 5.9165 8.46929 6.13525 8.11383 6.13525L1.11383 6.13525C0.7857 6.13525 0.457576 5.9165 0.320857 5.58838C0.184138 5.26025 0.26617 4.87744 0.512263 4.63135L4.01226 1.13135Z"
              fill="#5E5E5E"
            />
          </svg>
        </button>
      </div>
      {isExpanded && (
        <div className="space-y-3 border-t border-[#ECEAFC] px-4 py-3">
          <p className="text-[13px] leading-[1.6]">
            {quest.quest_description || 'No description'}
          </p>
        </div>
      )}
    </div>
  );
};
