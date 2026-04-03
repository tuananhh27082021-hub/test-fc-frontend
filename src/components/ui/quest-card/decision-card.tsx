import Image from 'next/image';
import Link from 'next/link';
import React, { memo, useMemo } from 'react';

import { ROUTES } from '@/config/routes';
import { useQuestStatus } from '@/hooks/use-quest-status';
import type { Quest } from '@/types/schema';
import { cn } from '@/utils/cn';
import { formatNumber } from '@/utils/number';
import { getBettingToken } from '@/utils/quest';

interface DecisionCardProps {
  quest: Quest;
  highlightAnswer?: boolean;
}

export const DecisionCard = memo(
  ({ quest, highlightAnswer }: DecisionCardProps) => {
    const totalBetting = useMemo(
      () =>
        (quest?.answers ?? []).reduce(
          (total, item) => total + item.total_betting_amount,
          0,
        ),
      [quest?.answers],
    );

    const token = useMemo(() => getBettingToken(quest), [quest]);

    const answersWithPercentage = useMemo(
      () =>
        (quest?.answers ?? []).map((answer) => {
          const percent = formatNumber(
            totalBetting > 0
              ? ((answer?.total_betting_amount ?? 0) / totalBetting) * 100
              : 0,
            { minimumFractionDigits: 0, maximumFractionDigits: 2 },
          );
          return {
            ...answer,
            percent,
          };
        }),
      [quest?.answers, totalBetting],
    );

    const { status } = useQuestStatus(quest);

    return (
      <Link href={ROUTES.QUEST_DETAIL(quest.quest_key)} key={quest.quest_key}>
        <div className="flex flex-col gap-4 rounded-lg border p-4">
          <div className="flex w-full items-center gap-2 font-baloo-2">
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
          <div className="flex flex-col gap-2">
            {answersWithPercentage.map(answer => (
              <div
                className={cn('flex flex-col', highlightAnswer && 'gap-1')}
                key={answer.answer_key}
              >
                <div
                  className={cn(
                    'flex justify-between font-baloo-2 text-[13px] font-medium text-[#1a1a1a]',
                    status !== 'ended' || answer.answer_selected
                      ? 'opacity-100'
                      : 'opacity-50',
                  )}
                >
                  <div>{answer.answer_title}</div>
                  <div className="flex gap-1">
                    <span>{`${answer.percent}%`}</span>
                    <span>{`(${Number.isInteger(answer.total_betting_amount) ? answer.total_betting_amount : answer.total_betting_amount.toFixed(2)} ${token.symbol})`}</span>
                  </div>
                </div>
                {highlightAnswer && (
                  <div
                    className={cn(
                      'h-[10px] overflow-hidden rounded-full',
                      answer.answer_selected ? 'bg-[#e9e6ff]' : 'bg-gray-300',
                    )}
                  >
                    <div
                      className={cn(
                        'h-full rounded-full',
                        answer.answer_selected
                          ? 'bg-[#3b27df]'
                          : 'bg-[#303030]',
                        answer.answer_selected ? 'opacity-100' : 'opacity-30',
                      )}
                      style={{
                        width: `${answer.percent}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            <span className="font-baloo-2 text-[13px] font-semibold">
              {status === 'ended' ? 'Closed' : 'In progress'}
            </span>
            <div className="flex gap-1 font-baloo-2 text-[13px]">
              <Image
                src={token.iconUrl}
                alt={token.name}
                width={12}
                height={12}
                className="object-contain"
              />
              <span className="font-semibold text-[#3B27DF]">
                {`${Number.isInteger(totalBetting) ? totalBetting : totalBetting.toFixed(2)}`}
                {' '}
                {token.symbol}
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  },
);

DecisionCard.displayName = 'DecisionCard';
