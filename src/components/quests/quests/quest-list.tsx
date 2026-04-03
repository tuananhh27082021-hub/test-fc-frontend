'use client';

import dayjs from 'dayjs';
import Link from 'next/link';
import { useState } from 'react';

import QuestCard, { QuestCardSkeketon } from '@/components/quest-card';
import { TRENDING_TOPIC_SLUG } from '@/components/quests/topics-header';
import { ScrollToTopButton } from '@/components/ui/scroll-to-top-button';
import { OPINION_BOUNTY_CATEGORY } from '@/config/constants';
import { ROUTES } from '@/config/routes';
import {
  useFetchPopularQuests,
  useFetchQuests,
  useQuestsFilters,
} from '@/hooks/use-fetch-quests';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useLiveQuests } from '@/hooks/use-live-quests';
import type { Quest } from '@/types/schema';
import { getBettingToken } from '@/utils/quest';

export const QuestList = () => {
  const { topicSlug } = useQuestsFilters();
  const isTrending = topicSlug === TRENDING_TOPIC_SLUG;

  if (isTrending) {
    return <TrendingQuestList />;
  }

  return <AllQuestList />;
};

const TrendingQuestList = () => {
  const { data: liveQuestsData } = useLiveQuests();
  const { data, isLoading } = useFetchPopularQuests();

  if (isLoading) {
    return <QuestListSkeleton />;
  }

  const quests = data?.data ?? [];

  if (quests.length === 0) {
    return <QuestListEmpty />;
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 2xl:lg:grid-cols-4">
      {quests.map(quest => (
        <QuestCardItem
          key={quest.quest_key}
          quest={quest}
          isLive={
            liveQuestsData?.liveQuestKeys.includes(quest.quest_key) ?? false
          }
        />
      ))}
    </div>
  );
};

const AllQuestList = () => {
  const { category, topicSlug } = useQuestsFilters();
  const { data: liveQuestsData } = useLiveQuests();
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data, isLoading, isFetching } = useFetchQuests({
    status: ['PUBLISH', 'DAO_SUCCESS', 'FINISH'],
    category,
    page: currentPage,
    topic: topicSlug ?? undefined,
  });

  const { allQuests, showScrollTop, hasReachedEnd, loadMoreRef, scrollToTop }
    = useInfiniteScroll({
      quests: data?.data?.quests ?? [],
      total: data?.data?.total ?? 0,
      isFetching,
      currentPage,
      onPageChange: setCurrentPage,
      resetDeps: [category, topicSlug],
    });

  if (isLoading && allQuests.length === 0) {
    return <QuestListSkeleton />;
  }

  if (!isLoading && allQuests.length === 0) {
    return <QuestListEmpty />;
  }

  const hasMoreData
    = !hasReachedEnd && allQuests.length < (data?.data?.total ?? 0);

  return (
    <>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 2xl:lg:grid-cols-4">
        {allQuests.map(quest => (
          <QuestCardItem
            key={quest.quest_key}
            quest={quest}
            isLive={
              liveQuestsData?.liveQuestKeys.includes(quest.quest_key) ?? false
            }
          />
        ))}
      </div>

      {hasMoreData && (
        <div ref={loadMoreRef} className="mt-8 flex justify-center py-4">
          {isFetching && (
            <span className="font-semibold text-[#3B27DF]">Loading...</span>
          )}
        </div>
      )}

      <ScrollToTopButton show={showScrollTop} onClick={scrollToTop} />
    </>
  );
};

const QuestCardItem = ({
  quest,
  isLive,
}: {
  quest: Quest;
  isLive: boolean;
}) => {
  const isOpinionBounty
    = quest.quest_category?.quest_category_title === OPINION_BOUNTY_CATEGORY;
  const isEnded
    = (!!quest.quest_finish_datetime
    && dayjs(quest.quest_finish_datetime).isBefore(dayjs()))
    || (!!quest.quest_end_date
    && dayjs(quest.quest_end_date).isBefore(dayjs()));

  return (
    <Link href={ROUTES.QUEST_DETAIL(quest.quest_key)}>
      <QuestCard
        name={quest.quest_title}
        image={quest?.quest_image_url}
        endAt={quest.quest_end_date}
        answers={quest.answers}
        total={
          isOpinionBounty
            ? (quest.extra_data?.points ?? 0)
            : quest.total_betting_amount
        }
        status={isEnded ? 'ended' : 'in-progress'}
        symbol={isOpinionBounty ? 'Points' : getBettingToken(quest).symbol}
        isOpinionBounty={isOpinionBounty}
        isLive={isLive}
      />
    </Link>
  );
};

const QuestListSkeleton = () => (
  <div className="grid grid-cols-2 gap-8 lg:grid-cols-3 2xl:lg:grid-cols-4">
    {Array.from({ length: 12 }).map((_, idx) => (
      <QuestCardSkeketon key={idx} />
    ))}
  </div>
);

const QuestListEmpty = () => (
  <div className="flex min-h-[600px] items-start justify-center p-10">
    No data
  </div>
);
