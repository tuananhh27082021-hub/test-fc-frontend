'use client';

import dayjs from 'dayjs';

import type { BaseAdminQuest } from '@/types/schema';

import { Skeleton } from '../../../ui/skeleton';

interface MobileAdjournViewProps {
  displayQuests: BaseAdminQuest[];
  isLoading: boolean;
  selectedQuests: string | null;
  onQuestToggle: (questKey: string) => void;
  currentPage: number | null;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const MobileAdjournView = ({
  displayQuests,
  isLoading,
  selectedQuests,
  onQuestToggle,
  currentPage,
  totalPages,
  onPageChange,
}: MobileAdjournViewProps) => {
  return (
    <>
      <div className="mb-2 flex gap-x-2 px-1 text-[10px] font-medium text-black/50">
        <span className="w-14 pl-4">Key</span>
        <span className="w-12 pl-2">Type</span>
        <span className="w-40 pl-4">Title</span>
        <span className="w-12 text-center">End date</span>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {['a', 'b', 'c', 'd', 'e'].map(key => (
            <div key={key}>
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="space-y-2">
          {displayQuests.map(q => (
            <div key={q.quest_key} className="flex items-center gap-x-2 text-[10px]">
              <div className="flex w-14 items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedQuests === q.quest_key}
                  onChange={() => onQuestToggle(q.quest_key)}
                  className="size-3.5 rounded border border-black bg-white checked:border-[#3B27DF] checked:bg-[#3B27DF]"
                />
                <span className="truncate text-black">{q.quest_key}</span>
              </div>
              <span className="w-12 truncate pl-2 text-black">Prediction</span>
              <span className="w-40 truncate pl-4 text-black">{q.quest_title}</span>
              <span className="w-12 text-center text-black">{dayjs(q.quest_end_date).format('YYYY/MM/DD')}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          onClick={() => onPageChange(Math.max(1, (currentPage ?? 1) - 1))}
          className="rounded-md bg-[#3B27DF] px-2 py-1 text-white disabled:opacity-40"
          disabled={(currentPage ?? 1) <= 1}
        >
          ‹
        </button>
        <span className="font-baloo-2 text-xs text-black">
          {currentPage ?? 1}
          {' '}
          /
          {' '}
          {totalPages}
        </span>
        <button
          type="button"
          aria-label="Next page"
          onClick={() => onPageChange(Math.min(totalPages, (currentPage ?? 1) + 1))}
          className="rounded-md bg-[#3B27DF] px-2 py-1 text-white disabled:opacity-40"
          disabled={(currentPage ?? 1) >= totalPages}
        >
          ›
        </button>
      </div>
    </>
  );
};
