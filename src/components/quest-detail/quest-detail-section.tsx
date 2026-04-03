'use client';

import { notFound, useParams } from 'next/navigation';

import { QuestDetailBody } from '@/components/quest-detail/quest-detail-body';
import { CustomBreadcrumb } from '@/components/ui/breadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { Typography } from '@/components/ui/typography';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useOpinionBounty } from '@/hooks/use-opinion-bounty';
import { useFetchQuest } from '@/hooks/use-quest';
import { HomeSolidIcon } from '@/icons/icons';
import type { QuestDetail } from '@/types/schema';

import { LiveStream } from './livestream';
import { OpinionDetailBody } from './opinion-detail-body';
import { YouTubeEmbed } from './youtube-embed';

export function QuestDetailSection() {
  const { questId } = useParams<{ questId: string }>();
  const { data, isLoading, error } = useFetchQuest(questId);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const quest = data?.data;
  const isOpinionBounty = useOpinionBounty(quest);

  if (isLoading) {
    return <QuestDetailSkeleton />;
  }

  if (error || !quest) {
    return notFound();
  }

  if (!['PUBLISH', 'DAO_SUCCESS', 'FINISH', 'MARKET_SUCCESS'].includes(quest.quest_status)) {
    return notFound();
  }

  return (
    <>
      {!isMobile && <QuestDetailHeader quest={quest} />}
      {!isMobile && (
        <div className="app-container p-6 md:px-8 lg:px-0">
          <LiveStream quest={quest} />
          {quest?.youtube_url && (
            <div className="mt-6">
              <YouTubeEmbed url={quest.youtube_url} />
            </div>
          )}
        </div>
      )}
      {isOpinionBounty
        ? (
            <OpinionDetailBody quest={quest} />
          )
        : (
            <QuestDetailBody quest={quest} />
          )}
    </>
  );
}

const QuestDetailSkeleton = () => {
  return (
    <div className="w-full space-y-6 p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-6 w-40" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>

      <div className="flex space-x-4">
        <div className="w-1/2 space-y-2">
          <Skeleton className="h-6 w-1/3" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="aspect-square w-1/2">
          <Skeleton className="size-full rounded-lg" />
        </div>
      </div>
    </div>
  );
};

const breadcrumbItems = [
  { label: 'Homepage', href: '/', icon: <HomeSolidIcon /> },
];

const QuestDetailHeader = ({ quest }: { quest: QuestDetail }) => {
  const sm = useMediaQuery('(min-width: 640px)');

  const breadcrumb = (
    <CustomBreadcrumb items={breadcrumbItems} currentPage="Quest" />
  );

  return (
    <div>
      {/* Hide mobile breadcrumb */}

      {!!sm && (
        <div className="border-b border-border bg-secondary-4 py-8">
          <div className="app-container px-6 md:px-8 lg:px-0">
            <div className="mb-6 inline-block rounded-2xl border border-border bg-white px-6 py-3.5">
              {breadcrumb}
            </div>

            <Typography
              asChild
              level="h5"
              className="font-clash-display font-semibold"
            >
              <h2>{quest.quest_title}</h2>
            </Typography>
          </div>
        </div>
      )}
    </div>
  );
};
