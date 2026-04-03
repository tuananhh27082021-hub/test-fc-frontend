'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Typography } from '@/components/ui/typography';
import { filterDAOQuestsOptions } from '@/config/constants';
import {
  useFetchDAOQuests,
  useFilterDAOQuests,
} from '@/hooks/use-fetch-quests';
import { useMediaQuery } from '@/hooks/use-media-query';
import type { DAOQuestCategory } from '@/types/schema';

import { Badge } from '../ui/badge';
import { DAOItemSkeleton } from './dao-item';
import { DAOList } from './dao-list';

export const DAOContainer = () => {
  const { status, setStatus, currentPage, setCurrentPage }
    = useFilterDAOQuests();

  const { data, isLoading } = useFetchDAOQuests({
    status,
  });

  const quests = data?.data?.quests ?? [];
  const totalPage = data?.data?.total;

  let content = null;

  if (isLoading) {
    content = (
      <div className="space-y-8">
        {Array.from({ length: 5 }).map((_, idx) => (
          <DAOItemSkeleton key={idx} />
        ))}
      </div>
    );
  } else if (totalPage === 0) {
    content = <div className="flex items-center justify-center">No data</div>;
  } else {
    content = (
      <DAOList
        //  @ts-expect-error ignore
        quests={quests}
        status={status}
        currentPage={currentPage ?? 1}
        setCurrentPage={setCurrentPage}
        totalPage={totalPage}
      />
    );
  }

  return (
    <div className="px-6">
      <div className="app-container translate-y-[-120px] rounded-t-8 bg-background py-5 md:rounded-t-12 md:p-10 lg:rounded-t-14 lg:p-14 xl:p-16">
        <DAOToolbar
          total={data?.data?.total ?? 0}
          status={status}
          setStatus={setStatus}
        />

        {content}
      </div>
    </div>
  );
};

const DAOToolbar = ({
  total,
  status,
  setStatus,
}: {
  total: number;
  status: DAOQuestCategory;
  setStatus: (status: DAOQuestCategory) => void;
}) => {
  const md = useMediaQuery('(min-width: 768px)');

  return (
    <div className="mb-8 flex items-center justify-between border-b border-dashed border-border pb-6 xl:pb-9">
      <div className="flex flex-1 items-center gap-2">
        <Typography
          level="h3"
          className="font-clash-display text-2xl font-medium"
        >
          {status === 'draft' && 'Draft'}
          {status === 'success' && 'Success'}
          {status === 'answer' && 'Answer'}
        </Typography>
        <Badge className="shrink-0" variant="outline">
          {total}
        </Badge>
      </div>

      {md
        ? (
            <div className="flex items-center gap-4">
              {filterDAOQuestsOptions.map(option => (
                <Button
                  key={option.value}
                  variant="outline"
                  noShadow={status !== option.value}
                  onClick={() => setStatus(option.value as any)}
                >
                  {option.name}
                </Button>
              ))}
            </div>
          )
        : (
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-auto min-w-[120px] border-2 border-border !shadow-light">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {filterDAOQuestsOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
    </div>
  );
};
