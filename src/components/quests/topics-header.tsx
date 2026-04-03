'use client';

import { LayoutGrid, TrendingUp } from 'lucide-react';
import { useRef } from 'react';

import type { Topic } from '@/types/schema';
import { cn } from '@/utils/cn';

export const TRENDING_TOPIC_SLUG = 'trending';

interface TopicsHeaderProps {
  topics: Topic[];
  selectedTopicSlug: string | null;
  onTopicSelect: (topicSlug: string | null) => void;
  className?: string;
}

export function TopicsHeader({
  topics,
  selectedTopicSlug,
  onTopicSelect,
  className,
}: TopicsHeaderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleTopicClick = (topicSlug: string | null) => {
    onTopicSelect(topicSlug);
  };

  const isTrending = selectedTopicSlug === TRENDING_TOPIC_SLUG;
  const isAll = selectedTopicSlug === null;

  return (
    <div className={cn('overflow-hidden', className)}>
      <div
        ref={scrollContainerRef}
        className="scrollbar-hide flex items-center gap-1 overflow-x-auto md:gap-2"
      >
        <button
          type="button"
          onClick={() => handleTopicClick(TRENDING_TOPIC_SLUG)}
          disabled={isTrending}
          className={cn(
            'flex shrink-0 items-center gap-1.5 px-1 py-2 md:p-2 transition-all',
            isTrending
              ? 'text-md md:text-lg font-bold text-primary'
              : 'text-sm md:text-md font-medium text-foreground hover:text-primary',
          )}
        >
          <TrendingUp className="size-4" />
          <span>Trending</span>
        </button>

        <button
          type="button"
          onClick={() => handleTopicClick(null)}
          disabled={isAll}
          className={cn(
            'flex shrink-0 items-center gap-1.5 px-1 py-2 md:p-2 transition-all',
            isAll
              ? 'text-md md:text-lg font-bold text-primary'
              : 'text-sm md:text-md font-medium text-foreground hover:text-primary',
          )}
        >
          <LayoutGrid className="size-4" />
          <span>All</span>
        </button>

        {topics.map(topic => (
          <button
            key={topic.id}
            type="button"
            onClick={() => handleTopicClick(topic.slug)}
            disabled={selectedTopicSlug === topic.slug}
            className={cn(
              'shrink-0 px-1 py-2 md:p-2 transition-all',
              selectedTopicSlug === topic.slug
                ? 'text-md md:text-lg font-bold text-primary'
                : 'text-sm md:text-md font-medium text-foreground hover:text-primary',
            )}
          >
            {topic.name}
          </button>
        ))}
      </div>
    </div>
  );
}
