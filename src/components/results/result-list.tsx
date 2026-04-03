'use client';

import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { ScrollToTopButton } from '@/components/ui/scroll-to-top-button';
import { Typography } from '@/components/ui/typography';
import { ROUTES } from '@/config/routes';
import { useFetchQuests } from '@/hooks/use-fetch-quests';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { CalendarIcon } from '@/icons/icons';
import type { Quest } from '@/types/schema';

import { Skeleton } from '../ui/skeleton';

export const ResultList = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data, isLoading, isFetching } = useFetchQuests({
    status: ['MARKET_SUCCESS'],
    category: 'all',
    page: currentPage,
  });

  const { allQuests, showScrollTop, hasReachedEnd, loadMoreRef, scrollToTop }
    = useInfiniteScroll({
      quests: data?.data?.quests ?? [],
      total: data?.data?.total ?? 0,
      isFetching,
      currentPage,
      onPageChange: setCurrentPage,
      resetDeps: [],
    });

  let content = null;

  if (isLoading && allQuests.length === 0) {
    content = (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4 2xl:grid-cols-4">
        {[...Array(12)].map((_, index) => (
          <div key={index} className="space-y-4 rounded-8 p-4">
            <Skeleton className="aspect-video w-full rounded-3xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (!isLoading && allQuests.length === 0) {
    return (
      <div className="flex min-h-[600px] items-start justify-center p-10">
        No data
      </div>
    );
  } else {
    content = (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4 2xl:grid-cols-4">
        {allQuests.map(quest => (
          <ResultCard key={quest.quest_key} quest={quest} />
        ))}
      </div>
    );
  }

  const hasMoreData
    = !hasReachedEnd && allQuests.length < (data?.data?.total ?? 0);

  return (
    <div className="w-full translate-y-[-100px] px-4 md:px-6 lg:translate-y-[-160px] lg:px-10 xl:px-12">
      <div className="mx-auto w-full rounded-8 bg-white p-6 md:p-8 lg:p-10 xl:max-w-[1800px] 2xl:p-24">
        {content}

        {hasMoreData && (
          <div ref={loadMoreRef} className="mt-8 flex justify-center py-4">
            {isFetching && (
              <span className="font-semibold text-[#3B27DF]">Loading...</span>
            )}
          </div>
        )}
      </div>

      <ScrollToTopButton show={showScrollTop} onClick={scrollToTop} />
    </div>
  );
};

const ResultCard = ({ quest }: { quest: Quest }) => {
  return (
    <Link
      key={quest.quest_key}
      href={ROUTES.RESULTS_DETAIL(`${quest.quest_key}`)}
    >
      <div className="w-full">
        <div className="relative aspect-4/3 overflow-hidden rounded-[40px_40px_24px_40px]">
          <Image
            src={quest.quest_image_url}
            fill
            alt={quest.quest_title}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            style={{
              objectFit: 'cover',
            }}
          />
        </div>
        <div className="mt-5 flex flex-col items-start gap-4">
          <Typography className="line-clamp-2 font-medium" level="h5">
            {quest.quest_title}
          </Typography>
          <div className="flex items-center gap-4">
            <CalendarIcon />
            <Typography>
              {dayjs(quest.quest_end_date).format('YYYY/MM/DD - hh:mm:ss')}
            </Typography>
          </div>

          <span className="rounded-lg border border-secondary bg-secondary-4 px-2 py-1 text-secondary">
            Results
          </span>
        </div>
      </div>
    </Link>
  );
};
