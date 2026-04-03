'use client';

import dayjs from 'dayjs';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';

import { useMediaQuery } from '@/hooks/use-media-query';
import { useOpinionBounty } from '@/hooks/use-opinion-bounty';
import { useFetchQuest } from '@/hooks/use-quest';
import { CalendarIcon } from '@/icons/icons';
import { formatNumber } from '@/utils/number';
import { getBettingToken } from '@/utils/quest';

import { OpinionItem, VoteItem } from '../quest-detail/vote-tab';
import { Badge } from '../ui/badge';
import { Typography } from '../ui/typography';

export function ResultDetail() {
  const { resultId } = useParams<{ resultId: string }>();
  const { data, isLoading, error } = useFetchQuest(resultId);
  const lg = useMediaQuery('(min-width: 1280px)');

  const quest = data?.data;
  const bettingToken = getBettingToken(quest);
  const isOpinionBounty = useOpinionBounty(quest);

  if (isLoading) {
    return 'loading...';
  }

  if (error || !quest) {
    return notFound();
  }

  const selectedAnswer = quest.answers.find(ans => ans.answer_selected);

  return (
    <div className="w-full translate-y-[-100px] px-4 md:px-6 lg:translate-y-[-160px] lg:px-10 xl:px-12">
      <div className="mx-auto w-full rounded-8 bg-white p-6 md:p-8 lg:p-10 xl:max-w-[1800px] xl:p-14 2xl:px-[252px] 2xl:py-24">
        <div className="flex flex-col gap-5 lg:flex-row lg:gap-20">
          <div className="lg:order-2">
            <div className="relative aspect-video w-full overflow-hidden rounded-12 lg:aspect-square lg:w-[340px] xl:w-[400px] 2xl:w-[465px]">
              <Image
                src={quest.quest_image_url}
                width={0}
                height={0}
                alt={quest.quest_title}
                sizes="100vw"
                style={{
                  width: '100%',
                  height: 'auto',
                }}
              />
            </div>
          </div>
          <div className="space-y-5 lg:order-1 lg:flex-1 lg:space-y-10">
            <div>
              {!!lg && (
                <div className="mb-3 flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="rounded-lg border-secondary bg-secondary-4 text-sm font-medium text-secondary"
                  >
                    Results
                  </Badge>

                  <div className="flex items-center gap-2">
                    <CalendarIcon />
                    <Typography level="body2">
                      {dayjs(quest?.quest_end_date ?? '').format(
                        'YYYY/MM/DD - hh:mm:ss',
                      )}
                    </Typography>
                  </div>
                </div>
              )}
              <Typography className="mb-2 font-medium md:text-2xl" asChild>
                <h3>{quest.quest_title}</h3>
              </Typography>
              <Typography level="body2" className="mb-4 md:mb-8">
                {quest.quest_description}
              </Typography>
            </div>

            <div className="flex flex-col gap-6 md:flex-row">
              <div className="shrink-0 rounded-8 border border-border px-14 py-6 lg:flex-1">
                <Typography
                  asChild
                  className="rounded-lg bg-black px-2 py-1 text-white"
                >
                  <span>Total</span>
                </Typography>
                <Typography className="mb-6 mt-4 font-bold" level="h3">
                  {isOpinionBounty
                    ? (
                        `${quest.total_betting} Votes`
                      )
                    : (
                        <div className="flex items-center gap-2">
                          <span>
                            {formatNumber(quest.total_betting_amount, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 4,
                            })}
                          </span>
                          <span>{bettingToken.symbol}</span>
                          <Image
                            src={bettingToken.iconUrl}
                            className="size-6 object-cover"
                            alt={bettingToken.symbol}
                            width={24}
                            height={24}
                          />
                        </div>
                      )}
                </Typography>
                <Typography level="body2">
                  {dayjs(quest.quest_end_date).format('DD MMM YYYY')}
                </Typography>
              </div>

              {selectedAnswer
                ? (
                    <div className="flex-1 rounded-8 border border-border bg-secondary p-8 text-center text-white">
                      <Typography level="body2" className="mb-2">
                        The final outcome is...
                      </Typography>
                      <Typography className="mb-4 font-bold" level="h3">
                        {selectedAnswer?.answer_title}
                      </Typography>
                      <Typography
                        level="body2"
                        className="rounded-lg border border-black bg-good px-2 py-1 font-medium text-black shadow-[0px_2px_0px_0px_#000000]"
                        asChild
                      >
                        <span>
                          {isOpinionBounty
                            ? `${formatNumber(
                              ((selectedAnswer?.total_betting ?? 0) * 100)
                              / quest.total_betting,
                              {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                              },
                            )} %`
                            : `${formatNumber(
                              ((selectedAnswer?.total_betting_amount ?? 0) * 100)
                              / quest.total_betting_amount,
                              {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 2,
                              },
                            )} % ${formatNumber(
                              selectedAnswer?.total_betting_amount ?? 0,
                              {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 4,
                              },
                            )} ${bettingToken.symbol}`}
                        </span>
                      </Typography>
                    </div>
                  )
                : (
                    <div className="flex flex-1 items-center justify-center rounded-8 border border-border bg-secondary p-8 text-center text-white">
                      <Typography level="body2" className="mb-2">
                        There is no winning outcome...
                      </Typography>
                    </div>
                  )}
            </div>
          </div>
        </div>

        <hr className="my-10 border-t border-dashed border-border md:my-12" />

        <div className="w-full space-y-4">
          {quest.answers.map((answer, index) => {
            if (isOpinionBounty) {
              const percent
                = quest.total_betting > 0
                  ? (answer.total_betting * 100) / quest.total_betting
                  : 0;
              return (
                <OpinionItem
                  index={index + 1}
                  key={answer.answer_key}
                  option={answer.answer_title}
                  percent={percent}
                />
              );
            }

            const percent
              = quest.total_betting_amount === 0
                ? 0
                : (answer.total_betting_amount * 100)
                / quest.total_betting_amount;
            return (
              <VoteItem
                index={index + 1}
                key={answer.answer_key}
                option={answer.answer_title}
                amount={answer.total_betting_amount}
                percent={percent}
                quest={quest}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
