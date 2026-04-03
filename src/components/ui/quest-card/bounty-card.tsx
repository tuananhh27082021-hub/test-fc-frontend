import { List } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { memo } from 'react';

import { ROUTES } from '@/config/routes';
import { useQuestStatus } from '@/hooks/use-quest-status';
import type { Quest } from '@/types/schema';
import { cn } from '@/utils/cn';

interface BountyCardProps {
  quest: Quest;
  highlightAnswer?: boolean;
}

export const BountyCard = memo(
  ({ quest, highlightAnswer }: BountyCardProps) => {
    const { status } = useQuestStatus(quest);

    const backgroundColorClasses = [
      'bg-[#3B27DF]',
      'bg-[#DF2755]',
      'bg-[#28AF3D]',
      'bg-[#E3961B]',
    ];

    return (
      <Link href={ROUTES.QUEST_DETAIL(quest.quest_key)}>
        <div className="flex flex-col gap-4 rounded-lg border p-4">
          <div className="flex w-full justify-between gap-2 font-baloo-2">
            <div className="flex items-center gap-2">
              <Image
                className="size-[48px] rounded object-cover"
                src={quest.quest_image_url}
                alt={quest.quest_title}
                width={48}
                height={48}
              />
              <p className="line-clamp-2 text-[13px] font-bold">
                {quest.quest_title}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <List />
              <span className="text-[13px]">Poll</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(quest?.answers ?? []).map((answer, index) => (
              <div
                className={cn(
                  'flex h-[40px] items-center justify-center rounded-2xl text-center font-baloo-2 text-[13px] font-semibold text-white',
                  backgroundColorClasses[index % backgroundColorClasses.length],
                  highlightAnswer && !answer.answer_selected && 'opacity-30',
                )}
                key={answer.answer_key}
              >
                {answer.answer_title}
              </div>
            ))}
          </div>
          <div className="flex justify-between font-semibold">
            <span className="font-baloo-2 text-[13px]">
              {status === 'ended' ? 'Closed' : 'In progress'}
            </span>
            <span className="font-baloo-2 text-[13px] font-semibold text-[#3B27DF]">{`${quest?.extra_data?.points ?? 0} Reward`}</span>
          </div>
        </div>
      </Link>
    );
  },
);

BountyCard.displayName = 'BountyCard';
