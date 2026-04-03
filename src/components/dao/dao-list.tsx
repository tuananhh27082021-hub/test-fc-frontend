'use client';

import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import type {
  DAOQuestAnswer,
  DAOQuestDraft,
  DAOQuestSuccess,
} from '@/types/schema';

import { PaginationContainer } from '../ui/pagination';
import { DAOItem } from './dao-item';

type DAOListProps =
  | {
    status: 'draft';
    quests: DAOQuestDraft[];
    totalPage?: number;
    currentPage?: number;
    setCurrentPage: (page: number) => void;
  }
  | {
    status: 'success';
    quests: DAOQuestSuccess[];
    totalPage?: number;
    currentPage?: number;
    setCurrentPage: (page: number) => void;
  }
  | {
    status: 'answer';
    quests: DAOQuestAnswer[];
    totalPage?: number;
    currentPage?: number;
    setCurrentPage: (page: number) => void;
  };

export const DAOList = ({
  quests,
  status,
  totalPage,
  currentPage,
  setCurrentPage,
}: DAOListProps) => {
  return (
    <div>
      <div className="divide-y-2">
        {quests.map(quest => (
          // @ts-expect-error ignore
          <DAOItem key={quest.quest_key} quest={quest} status={status} />
        ))}
      </div>
      {!!totalPage && (
        <PaginationContainer
          className="mt-10"
          totalPages={totalPage / DEFAULT_PAGE_SIZE}
          currentPage={currentPage ?? 1}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};
