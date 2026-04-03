import dayjs from 'dayjs';
import { CheckIcon } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useOpinionBounty } from '@/hooks/use-opinion-bounty';
import { CalendarIcon, ShareIcon } from '@/icons/icons';
import type { QuestDetail } from '@/types/schema';
import { formatNumber } from '@/utils/number';
import { getBettingToken, getQuestUrl } from '@/utils/quest';

import { Badge } from '../ui/badge';

export const QuestCard = ({ quest }: { quest?: QuestDetail }) => {
  const lg = useMediaQuery('(min-width: 1280px)');
  const token = getBettingToken(quest);
  const [copiedText, copy, setCopiedText] = useCopyToClipboard();
  const isOpinionBounty = useOpinionBounty(quest);

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border bg-gray-200 lg:aspect-square lg:size-[465px] lg:rounded-12">
      {!!lg && (
        <div className="absolute inset-x-0 bottom-0 z-[1] hidden w-full items-center justify-between rounded-t-8 border border-border bg-white py-4 pl-6 pr-9 lg:flex">
          <Typography level="h5" className="flex-1 font-medium">
            Total:
          </Typography>
          <div className="flex flex-col gap-1 text-right">
            {isOpinionBounty
              ? (
                  <Typography level="h3" className="font-extrabold">
                    {formatNumber(quest?.extra_data?.points ?? 0, {
                      minimumFractionDigits: 0,
                    })}
                    {' '}
                    Points
                  </Typography>
                )
              : (
                  <Typography level="h3" className="font-extrabold">
                    {formatNumber(quest?.total_betting_amount ?? 0, {
                      minimumFractionDigits: 0,
                    })}
                    {' '}
                    {token.symbol}
                  </Typography>
                )}
            <Typography level="body2">
              {dayjs(quest?.quest_end_date).format('DD MMM YYYY')}
            </Typography>
          </div>
        </div>
      )}

      {!lg && (
        <div className="absolute bottom-4 right-2 z-[1] flex items-center gap-3 rounded-2xl border border-border bg-white px-4 py-2 md:px-6 md:py-4 lg:hidden">
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

      <Button
        variant="outline"
        size="icon"
        className="absolute right-6 top-6 z-[1] size-9 rounded-full lg:size-16"
        onClick={() => {
          if (quest) {
            copy(getQuestUrl(quest.quest_key)).then(() =>
              setTimeout(() => {
                setCopiedText('');
              }, 1000),
            );
          }
        }}
      >
        {copiedText
          ? (
              <CheckIcon className="size-4 lg:size-6" />
            )
          : (
              <ShareIcon className="size-4 lg:size-6" />
            )}
      </Button>
      <Image
        src={quest?.quest_image_url ?? ''}
        alt={quest?.quest_title ?? ''}
        width={0}
        height={0}
        sizes="100vw"
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  );
};
