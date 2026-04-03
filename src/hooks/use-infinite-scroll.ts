import { useCallback, useEffect, useRef, useState } from 'react';

import type { Quest } from '@/types/schema';

interface UseInfiniteScrollOptions {
  quests: Quest[];
  total: number;
  isFetching: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  resetDeps?: any[];
}

interface UseInfiniteScrollReturn {
  allQuests: Quest[];
  showScrollTop: boolean;
  isLoadingMore: boolean;
  hasReachedEnd: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement>;
  scrollToTop: () => void;
  resetScroll: () => void;
}

export const useInfiniteScroll = ({
  quests,
  total,
  isFetching,
  currentPage,
  onPageChange,
  resetDeps = [],
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn => {
  const [allQuests, setAllQuests] = useState<Quest[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Reset when dependencies change
  const resetScroll = useCallback(() => {
    onPageChange(1);
    setAllQuests([]);
    setHasReachedEnd(false);
    setIsLoadingMore(false);
  }, [onPageChange]);

  useEffect(() => {
    if (resetDeps.length > 0) {
      resetScroll();
    }
  }, resetDeps);

  // Update allQuests when data changes
  useEffect(() => {
    if (currentPage === 1) {
      setAllQuests(quests);
      setIsLoadingMore(false);
      if (!isFetching) {
        setHasReachedEnd(quests.length === 0);
      }
    } else if (quests.length > 0) {
      setAllQuests((prev) => {
        const existingIds = new Set(prev.map(q => q.quest_key));
        const newQuests = quests.filter(q => !existingIds.has(q.quest_key));
        const combined = [...prev, ...newQuests];

        if (
          !isFetching
          && (newQuests.length === 0 || combined.length >= total)
        ) {
          setHasReachedEnd(true);
        }

        return combined;
      });
      setIsLoadingMore(false);
    } else if (!isFetching) {
      setIsLoadingMore(false);
      setHasReachedEnd(true);
    }
  }, [quests, currentPage, total, isFetching]);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (hasReachedEnd || isFetching || isLoadingMore) {
      return;
    }

    if (allQuests.length >= total) {
      return;
    }

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoadingMore && !hasReachedEnd) {
          setIsLoadingMore(true);
          onPageChange(currentPage + 1);
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [
    hasReachedEnd,
    isFetching,
    isLoadingMore,
    allQuests.length,
    total,
    currentPage,
    onPageChange,
  ]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    allQuests,
    showScrollTop,
    isLoadingMore,
    hasReachedEnd,
    loadMoreRef,
    scrollToTop,
    resetScroll,
  };
};
