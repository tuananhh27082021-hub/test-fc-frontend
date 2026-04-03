import dayjs from 'dayjs';

import { Badge } from '@/components/ui/badge';
import { Typography } from '@/components/ui/typography';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useOpinionBounty } from '@/hooks/use-opinion-bounty';
import { CalendarIcon } from '@/icons/icons';
import type { QuestDetail } from '@/types/schema';
import { formatNumber } from '@/utils/number';
import { getBettingToken } from '@/utils/quest';

export const QuestInfo = ({ quest }: { quest?: QuestDetail }) => {
  const lg = useMediaQuery('(min-width: 1280px)');
  const isOpinionBounty = useOpinionBounty(quest);

  return (
    <div className="w-full">
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

      <Typography asChild level="h5" className="mb-3 font-medium lg:text-2xl">
        <h3>{quest?.quest_title}</h3>
      </Typography>

      <div className="flex flex-col gap-2.5 md:flex-row">
        <Typography level="body2" className="text-foreground-70 md:flex-1">
          {quest?.quest_description}
        </Typography>

        <Typography level="body2" className="font-medium lg:hidden">
          Total:
          {' '}
          {isOpinionBounty
            ? (
                <span className="text-2xl font-bold">
                  {formatNumber(quest?.total_betting ?? 0, {
                    minimumFractionDigits: 0,
                  })}
                  {' '}
                  Votes
                </span>
              )
            : (
                <span className="text-2xl font-bold">
                  {formatNumber(quest?.total_betting_amount ?? 0, {
                    minimumFractionDigits: 0,
                  })}
                  {' '}
                  {getBettingToken(quest).symbol}
                </span>
              )}
        </Typography>
      </div>
    </div>
  );
};
