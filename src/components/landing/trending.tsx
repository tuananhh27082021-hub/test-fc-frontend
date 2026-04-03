'use client';

import { ArrowRight, Settings2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { TopicsHeader, TRENDING_TOPIC_SLUG } from '@/components/quests/topics-header';
import { Input } from '@/components/ui/input';
import { BountyCard } from '@/components/ui/quest-card/bounty-card';
import { DecisionCard } from '@/components/ui/quest-card/decision-card';
import { NoResults } from '@/components/ui/quest-card/no-results';
import { LoadingSkeleton } from '@/components/ui/quest-card/skeleton-card';
import { OPINION_BOUNTY_CATEGORY } from '@/config/constants';
import { ROUTES } from '@/config/routes';
import { useFetchPopularQuests, useFetchQuests } from '@/hooks/use-fetch-quests';
import { useFetchTopics } from '@/hooks/use-topics';

export const Trending = () => {
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>('');
  const [selectedTopicSlug, setSelectedTopicSlug] = useState<string | null>(TRENDING_TOPIC_SLUG);
  const { data: topicsData } = useFetchTopics();
  const topics = useMemo(() => topicsData?.data ?? [], [topicsData?.data]);

  const isTrending = selectedTopicSlug === TRENDING_TOPIC_SLUG;

  const { data: trendingData, isLoading: isTrendingLoading } = useFetchPopularQuests(
    debouncedKeyword,
  );

  const { data: topicQuestsData, isLoading: isTopicQuestsLoading } = useFetchQuests({
    status: ['PUBLISH', 'DAO_SUCCESS', 'FINISH'],
    page: 1,
    size: 8,
    keyword: debouncedKeyword,
    topic: selectedTopicSlug && selectedTopicSlug !== TRENDING_TOPIC_SLUG
      ? selectedTopicSlug
      : undefined,
  });

  const isLoading = isTrending ? isTrendingLoading : isTopicQuestsLoading;
  const data = isTrending ? trendingData?.data : topicQuestsData?.data?.quests;
  const quests = useMemo(() => data ?? [], [data]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchKeyword(e.target.value);
    },
    [],
  );

  const handleTopicSelect = useCallback((topicSlug: string | null) => {
    setSelectedTopicSlug(topicSlug);
  }, []);

  const handleViewAllClick = useCallback(() => {
    router.push(ROUTES.QUESTS);
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchKeyword]);

  const renderQuests = useMemo(() => {
    if (isLoading) {
      return <LoadingSkeleton />;
    }

    if (quests.length === 0) {
      return <NoResults />;
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {quests.map(quest =>
          quest?.quest_category?.quest_category_title === OPINION_BOUNTY_CATEGORY
            ? (
                <BountyCard key={quest.quest_key} quest={quest} />
              )
            : (
                <DecisionCard key={quest.quest_key} quest={quest} />
              ),
        )}
      </div>
    );
  }, [isLoading, quests]);

  return (
    <div className="gap-3 p-4">
      <div className="mb-4">
        <TopicsHeader
          topics={topics}
          selectedTopicSlug={selectedTopicSlug}
          onTopicSelect={handleTopicSelect}
        />
      </div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <Input
          className="h-[40px] !rounded-2xl"
          placeholder="Search"
          value={searchKeyword}
          onChange={handleSearchChange}
        />
        <Settings2 width={24} height={24} />
      </div>
      {renderQuests}
      <div className="flex w-full justify-center">
        <button
          type="button"
          className="mt-4 flex items-center justify-center gap-1 rounded-lg border border-[#3B27DF] px-4 py-1.5"
          onClick={handleViewAllClick}
        >
          <span className="font-baloo-2 text-[14px] font-semibold text-[#3B27DF]">
            View all
          </span>
          <ArrowRight className="text-[#3B27DF]" />
        </button>
      </div>
    </div>
  );
};

Trending.displayName = 'Trending';
