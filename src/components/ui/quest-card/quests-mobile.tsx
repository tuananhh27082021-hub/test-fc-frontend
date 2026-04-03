import { Plus, Settings2 } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuth } from '@/app/auth-provider';
import NewPredictionDialog from '@/components/new-prediction-dialog';
import {
  TopicsHeader,
  TRENDING_TOPIC_SLUG,
} from '@/components/quests/topics-header';
import { Input } from '@/components/ui/input';
import { BountyCard } from '@/components/ui/quest-card/bounty-card';
import { DecisionCard } from '@/components/ui/quest-card/decision-card';
import { NoResults } from '@/components/ui/quest-card/no-results';
import { LoadingSkeleton } from '@/components/ui/quest-card/skeleton-card';
import { ScrollToTopButton } from '@/components/ui/scroll-to-top-button';
import { OPINION_BOUNTY_CATEGORY } from '@/config/constants';
import {
  useFetchPopularQuests,
  useFetchQuests,
  useQuestsFilters,
} from '@/hooks/use-fetch-quests';
import { useFetchTopics } from '@/hooks/use-topics';
import type { Quest, QuestStatus } from '@/types/schema';
import { isAdmin } from '@/utils/member';

const PAGE_SIZE = 10;

export interface IQuestsMobileProps {
  status?: QuestStatus[] | 'all';
  highlightAnswer?: boolean;
}

export const QuestsMobile = ({
  status,
  highlightAnswer = false,
}: IQuestsMobileProps) => {
  const { user } = useAuth();
  const isUserAdmin = isAdmin(user);

  const { topicSlug, setTopicSlug } = useQuestsFilters();
  const isTrending = topicSlug === TRENDING_TOPIC_SLUG;

  const [open, setOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [allQuests, setAllQuests] = useState<Quest[]>([]);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  /* -------------------- DATA -------------------- */

  const { data: topicsData } = useFetchTopics();
  const topics = topicsData?.data ?? [];

  const {
    data: questsData,
    isLoading: isLoadingAll,
    isFetching,
  } = useFetchQuests({
    status,
    category: 'all',
    page: currentPage,
    keyword: debouncedKeyword,
    size: PAGE_SIZE,
    topic: isTrending ? undefined : (topicSlug ?? undefined),
  });

  const { data: popularData, isLoading: isLoadingPopular }
    = useFetchPopularQuests(debouncedKeyword);

  const questsFromApi = useMemo(() => {
    return isTrending
      ? (popularData?.data ?? [])
      : (questsData?.data?.quests ?? []);
  }, [isTrending, popularData, questsData]);

  const totalFromApi = useMemo(
    () =>
      isTrending
        ? (popularData?.data?.length ?? 0)
        : (questsData?.data?.total ?? 0),
    [isTrending, popularData, questsData],
  );

  const isLoading = isTrending ? isLoadingPopular : isLoadingAll;

  /* -------------------- EFFECTS -------------------- */

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
      setCurrentPage(1);
      setHasReachedEnd(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  useEffect(() => {
    if (isTrending) {
      setAllQuests(questsFromApi);
      setHasReachedEnd(true);
      setIsLoadingMore(false);
      return;
    }

    if (currentPage === 1) {
      setAllQuests(questsFromApi);
      if (!isFetching) {
        setHasReachedEnd(questsFromApi.length < PAGE_SIZE);
      }
      setIsLoadingMore(false);
      return;
    }

    if (!isFetching && questsFromApi.length === 0) {
      setHasReachedEnd(true);
      setIsLoadingMore(false);
      return;
    }

    setAllQuests((prev) => {
      const existed = new Set(prev.map(q => q.quest_key));
      const newItems = questsFromApi.filter(q => !existed.has(q.quest_key));
      const merged = [...prev, ...newItems];

      if (!isFetching && totalFromApi > 0 && merged.length >= totalFromApi) {
        setHasReachedEnd(true);
      }

      return merged;
    });

    setIsLoadingMore(false);
  }, [questsFromApi, currentPage, isTrending, totalFromApi]);

  // scroll to top button
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // infinite scroll
  useEffect(() => {
    if (isTrending || hasReachedEnd || isFetching || isLoadingMore) {
      return;
    }

    if (allQuests.length >= totalFromApi) {
      return;
    }

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        setIsLoadingMore(true);
        setCurrentPage(p => p + 1);
      }
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [
    isTrending,
    hasReachedEnd,
    isFetching,
    isLoadingMore,
    allQuests.length,
    totalFromApi,
  ]);

  /* -------------------- HANDLERS -------------------- */

  const handleTopicSelect = useCallback(
    (slug: string | null) => {
      setTopicSlug(slug);
      setCurrentPage(1);
      setAllQuests([]);
      setHasReachedEnd(false);
    },
    [setTopicSlug],
  );

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  /* -------------------- RENDER -------------------- */

  const renderList = useMemo(() => {
    if (isLoading && allQuests.length === 0) {
      return <LoadingSkeleton />;
    }

    if (!isLoading && allQuests.length === 0) {
      return <NoResults />;
    }

    return (
      <div className="grid grid-cols-1 gap-4">
        {allQuests.map(quest =>
          quest.quest_category?.quest_category_title
          === OPINION_BOUNTY_CATEGORY
            ? (
                <BountyCard
                  key={quest.quest_key}
                  quest={quest}
                  highlightAnswer={highlightAnswer}
                />
              )
            : (
                <DecisionCard
                  key={quest.quest_key}
                  quest={quest}
                  highlightAnswer={highlightAnswer}
                />
              ),
        )}
      </div>
    );
  }, [isLoading, allQuests, highlightAnswer]);

  return (
    <div className="gap-3">
      <TopicsHeader
        topics={topics}
        selectedTopicSlug={topicSlug}
        onTopicSelect={handleTopicSelect}
      />

      <div className="p-4">
        <div className="mb-4 flex items-center gap-2">
          <Input
            className="h-[40px] !rounded-2xl"
            placeholder="Search"
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
          />

          {isUserAdmin && (
            <NewPredictionDialog open={open} onOpenChange={setOpen}>
              <Plus width={24} height={24} />
            </NewPredictionDialog>
          )}

          <Settings2 width={24} height={24} />
        </div>

        {renderList}

        {!isTrending && allQuests.length < totalFromApi && (
          <div ref={loadMoreRef} className="flex justify-center py-4">
            {isFetching && (
              <span className="font-semibold text-[#3B27DF]">Loading...</span>
            )}
          </div>
        )}
      </div>

      {showScrollTop && <ScrollToTopButton show onClick={scrollToTop} />}
    </div>
  );
};

QuestsMobile.displayName = 'QuestsMobile';
