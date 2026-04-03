'use client';

import dayjs from 'dayjs';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { OPINION_BOUNTY_CATEGORY } from '@/config/constants';
import { ROUTES } from '@/config/routes';
import { useFetchPopularQuests } from '@/hooks/use-fetch-quests';
import { ArrowTopRightIcon } from '@/icons/icons';
import { getBettingToken } from '@/utils/quest';

import QuestCard from '../quest-card';

export const PopularVote = () => {
  const { data } = useFetchPopularQuests();
  const popularQuests = data?.data ?? [];

  return (
    <div className="app-container pt-20">
      <Typography
        className="mb-4 text-center font-clash-display font-semibold md:text-left"
        level="h2"
      >
        Popular Vote
      </Typography>
      <div className="mb-7 items-center justify-between md:flex">
        <Typography level="h5" className="text-center font-normal md:text-left">
          Innovative Knowledge Platform for Collective Intelligence Prediction
        </Typography>
        <Link href={ROUTES.QUESTS} className="hidden md:inline">
          <Button noShadow variant="link" endDecorator={<ArrowTopRightIcon />}>
            View all
          </Button>
        </Link>
      </div>
      <div className="grid-flow-col-1 grid gap-8 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {popularQuests.map(quest => (
          <Link
            href={ROUTES.QUEST_DETAIL(quest.quest_key)}
            key={quest.quest_key}
          >
            {quest.quest_category?.quest_category_title
            === OPINION_BOUNTY_CATEGORY
              ? (
                  <QuestCard
                    name={quest.quest_title}
                    image={quest?.quest_image_url}
                    endAt={quest.quest_end_date}
                    answers={quest.answers}
                    total={quest.extra_data?.points ?? 0}
                    status={
                      (!!quest.quest_finish_datetime
                      && dayjs(quest.quest_finish_datetime).isBefore(dayjs()))
                      || (quest.quest_end_date
                      && dayjs(quest.quest_end_date).isBefore(dayjs()))
                        ? 'ended'
                        : 'in-progress'
                    }
                    symbol="Points"
                    isOpinionBounty={true}
                  />
                )
              : (
                  <QuestCard
                    name={quest.quest_title}
                    image={quest?.quest_image_url}
                    endAt={quest.quest_end_date}
                    answers={quest.answers}
                    total={quest.total_betting_amount}
                    status={
                      (!!quest.quest_finish_datetime
                      && dayjs(quest.quest_finish_datetime).isBefore(dayjs()))
                      || (quest.quest_end_date
                      && dayjs(quest.quest_end_date).isBefore(dayjs()))
                        ? 'ended'
                        : 'in-progress'
                    }
                    symbol={getBettingToken(quest).symbol}
                    isOpinionBounty={false}
                  />
                )}
          </Link>
        ))}
      </div>

      <div className="mt-7 flex items-center justify-center md:hidden">
        <Link href={ROUTES.QUESTS} className="">
          <Button variant="outline" endDecorator={<ArrowTopRightIcon />}>
            View All
          </Button>
        </Link>
      </div>
    </div>
  );
};
