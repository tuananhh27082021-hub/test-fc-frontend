'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import dayjs from 'dayjs';
import Image from 'next/image';

import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import { Typography } from '@/components/ui/typography';
import { useGetGovernanceConfig } from '@/hooks/use-contract';
import type {
  DAOQuestAnswer,
  DAOQuestDraft,
  DAOQuestSuccess,
} from '@/types/schema';
import { cn } from '@/utils/cn';
import { extractDAOQuest } from '@/utils/quest';

import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { QuestTab } from './quest-tab';
import { VotingTab } from './voting-tab';

type DAOQuestItemProps =
  | { status: 'draft'; quest: DAOQuestDraft }
  | { status: 'success'; quest: DAOQuestSuccess }
  | { status: 'answer'; quest: DAOQuestAnswer };

export const DAOItem = ({ quest, status }: DAOQuestItemProps) => {
  const { maxVote } = useGetGovernanceConfig();

  const { quest_title, quest_image_url } = quest;

  const { startAt, endAt, isEnded } = extractDAOQuest(
    quest,
    status,
    Number(maxVote ?? 0),
  );

  return (
    <div className="flex flex-col gap-4 py-8 md:gap-6 lg:flex-row lg:gap-10">
      <div className="relative aspect-square w-full overflow-hidden rounded-b-2xl rounded-t-12 lg:w-[450px]">
        <div className="absolute inset-x-0 bottom-0 z-[3] flex items-center justify-between rounded-2xl bg-black/80 px-4 py-3 backdrop-blur-[32px]">
          <div className="lg:w-[70%]">
            <div className="flex w-full items-center justify-between gap-4">
              <Typography level="body2" className="text-foreground-50">
                Begins
              </Typography>
              <Typography level="body2" className="text-medium text-white">
                {startAt
                  ? dayjs(startAt).format('YYYY-MM-DD | hh:mm:ss')
                  : 'N/A'}
              </Typography>
            </div>
            <div className="flex w-full items-center justify-between gap-4">
              <Typography level="body2" className="text-foreground-50">
                Ends:
              </Typography>
              <Typography level="body2" className="text-medium text-white">
                {endAt ? dayjs(endAt).format('YYYY-MM-DD | hh:mm:ss') : 'N/A'}
              </Typography>
            </div>
          </div>
          <div className="flex flex-1 justify-end">
            <Badge variant="filled" color={isEnded ? 'default' : 'alert'}>
              {isEnded ? 'Close' : 'Process'}
            </Badge>
          </div>
        </div>
        <Image
          className={isEnded ? 'grayscale' : ''}
          src={quest_image_url}
          alt={quest_title}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: '100%', height: 'auto' }}
        />
      </div>
      <div className="flex-1">
        <Typography level="h4" className="mb-6 font-medium">
          {quest_title}
        </Typography>

        <Tabs className="rounded-xl border border-border" defaultValue="quest">
          <TabsList className="w-full justify-start gap-4 border-b border-border px-5">
            <TabsPrimitive.Trigger
              className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-tl-xl rounded-tr-xl px-1 pb-2 pt-4 border-b-[5px] border-transparent ring-offset-background transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
                'disabled:pointer-events-none disabled:opacity-50',
                'data-[state=active]:border-secondary',
              )}
              value="quest"
            >
              Quest
            </TabsPrimitive.Trigger>
            <TabsPrimitive.Trigger
              className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-tl-xl rounded-tr-xl px-1 pb-2 pt-4 border-b-[5px] border-transparent ring-offset-background transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
                'disabled:pointer-events-none disabled:opacity-50',
                'data-[state=active]:border-secondary',
              )}
              value="voting"
            >
              Voting
            </TabsPrimitive.Trigger>
          </TabsList>
          <TabsContent className="mt-0 px-5 py-4" value="quest">
            {/* @ts-expect-error ignore */}
            <QuestTab quest={quest} status={status} />
          </TabsContent>
          <TabsContent className="mt-0 px-5 py-4" value="voting">
            {/* @ts-expect-error ignore */}
            <VotingTab quest={quest} status={status} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export const DAOItemSkeleton = () => {
  return (
    <div className="flex gap-10">
      <div className="relative h-[330px] w-[450px] overflow-hidden rounded-b-2xl rounded-t-12">
        <Skeleton className="size-full" />
      </div>

      <div className="flex-1 py-6">
        <Skeleton className="mb-4 h-6 w-1/2" />
        <Skeleton className="mb-8 h-6 w-3/4" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    </div>
  );
};
