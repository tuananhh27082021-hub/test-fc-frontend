'use client';

import { useState } from 'react';

import type { AdminAnswerQuest, BaseAdminQuest } from '@/types/schema';

import { Skeleton } from '../../../ui/skeleton';

interface MobileAnswerViewProps {
  displayQuests: BaseAdminQuest[];
  isLoading: boolean;
  selectedQuests: string | null;
  onQuestToggle: (questKey: string) => void;
  currentPage: number | null;
  totalPages: number;
  onPageChange: (page: number) => void;
  onOptionSelect: (questKey: string, optionKey: string) => void;
  selectedAnswers: Record<string, string>;
}

export const MobileAnswerView = ({
  displayQuests,
  isLoading,
  selectedQuests,
  onQuestToggle,
  currentPage,
  totalPages,
  onPageChange,
  onOptionSelect,
  selectedAnswers,
}: MobileAnswerViewProps) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (questKey: string) => {
    if (openDropdown === questKey) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(questKey);
    }
  };

  const handleOptionSelect = (questKey: string, optionKey: string) => {
    onOptionSelect(questKey, optionKey);
    setOpenDropdown(null);
  };

  return (
    <>
      <div className="mb-2 flex gap-x-1 px-1 text-[10px] font-medium text-black/50">
        <span className="w-16 pl-4">Key</span>
        <span className="w-12">Type</span>
        <span className="w-20">Title</span>
        <span className="flex-1">Selected Answer</span>
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
          {displayQuests.map((q) => {
            const answerQuest = q as unknown as AdminAnswerQuest;
            const answers = answerQuest?.answers ?? [];
            const dropdownKey = `${q.quest_key}-answer`;

            // Get selected answer from local state or from server
            const localSelectedAnswerKey = selectedAnswers[q.quest_key];
            const serverSelectedAnswer = (answerQuest as any)?.answer_selected;

            // Find the selected answer title
            let selectedTitle = 'Choose final answer';
            if (localSelectedAnswerKey) {
              const selectedAnswer = answers.find(
                (ans: any) => ans.answer_key === localSelectedAnswerKey,
              );
              selectedTitle
                = selectedAnswer?.answer_title || 'Choose final answer';
            } else if (serverSelectedAnswer) {
              selectedTitle = serverSelectedAnswer;
            }

            return (
              <div
                key={q.quest_key}
                className="flex items-center gap-x-1 text-[10px]"
              >
                <div className="flex w-16 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedQuests === q.quest_key}
                    onChange={() => onQuestToggle(q.quest_key)}
                    className="size-3.5 rounded border border-black bg-white checked:border-[#3B27DF] checked:bg-[#3B27DF]"
                  />
                  <span className="truncate text-black">{q.quest_key}</span>
                </div>
                <span className="w-12 truncate text-black">
                  {q.quest_category || 'Prediction'}
                </span>
                <span className="w-20 truncate text-black">
                  {q.quest_title}
                </span>
                <div className="relative flex-1">
                  <button
                    type="button"
                    disabled={(answerQuest as any)?.answer_selected}
                    onClick={() => toggleDropdown(dropdownKey)}
                    className="flex w-full items-center justify-between rounded border border-[#A7A7A7] bg-white px-1 py-0.5 text-left text-[10px] text-black"
                  >
                    <span>{selectedTitle}</span>
                    <svg
                      width="5"
                      height="3"
                      viewBox="0 0 5 3"
                      fill="none"
                      className={`transition-transform ${openDropdown === dropdownKey ? 'rotate-180' : ''}`}
                    >
                      <path d="M0 0L2.5 3L5 0H0Z" fill="#282828" />
                    </svg>
                  </button>

                  {openDropdown === dropdownKey && (
                    <div className="absolute inset-x-0 top-full z-50 mt-1 rounded border border-[#A7A7A7] bg-white">
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => handleOptionSelect(q.quest_key, '')}
                          className="w-full px-2 py-1 text-left text-[10px] text-black hover:bg-gray-100"
                        >
                          Choose final answer
                        </button>
                        {answers.map((ans: any) => (
                          <button
                            key={ans.answer_key}
                            type="button"
                            onClick={() =>
                              handleOptionSelect(q.quest_key, ans.answer_key)}
                            className="w-full px-2 py-1 text-left text-[10px] text-black hover:bg-gray-100"
                          >
                            {ans.answer_title}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
          {totalPages}
        </span>
        <button
          type="button"
          aria-label="Next page"
          onClick={() =>
            onPageChange(Math.min(totalPages, (currentPage ?? 1) + 1))}
          className="rounded-md bg-[#3B27DF] px-2 py-1 text-white disabled:opacity-40"
          disabled={(currentPage ?? 1) >= totalPages}
        >
          ›
        </button>
      </div>
    </>
  );
};
