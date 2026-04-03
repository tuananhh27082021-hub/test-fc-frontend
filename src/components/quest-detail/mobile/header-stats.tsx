import Image from 'next/image';

import { BarChartIcon } from '@/components/ui/bar-chart-icon';
import { CalendarIcon } from '@/components/ui/calendar-icon';
import { useOpinionBounty } from '@/hooks/use-opinion-bounty';
import type { QuestDetail } from '@/types/schema';
import { getBettingToken } from '@/utils/quest';

function formatUsDate(dateStr?: string) {
  if (!dateStr) {
    return 'N/A';
  }
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) {
    return 'N/A';
  }
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function formatNumber(num?: number) {
  if (num == null) {
    return '0';
  }
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(
    num,
  );
}

export const MobileHeaderStats = ({ quest }: { quest: QuestDetail }) => {
  const totalBettingAmount = quest.total_betting_amount ?? 0;
  const bettingToken = getBettingToken(quest);
  const isOpinionBounty = useOpinionBounty(quest);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <BarChartIcon className="text-[#3B27DF]" />
          <span className="font-baloo-2 text-xs font-bold">Volume</span>
        </div>
        <div className="flex items-center gap-1">
          {isOpinionBounty
            ? (
                <span className="font-['Baloo_2'] text-sm font-medium">
                  {quest.total_betting}
                  {' '}
                  Votes
                </span>
              )
            : (
                <>
                  <Image
                    src={bettingToken.iconUrl}
                    alt="USDT"
                    width={20}
                    height={20}
                    className="size-5"
                  />
                  <div className="justify-start text-right font-['Baloo_2'] text-xs font-bold text-indigo-700">
                    {formatNumber(totalBettingAmount)}
                    {' '}
                    {bettingToken.symbol}
                  </div>
                </>
              )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <CalendarIcon className="text-[#3B27DF]" />
          <span className="font-baloo-2 text-xs font-bold">End Date</span>
        </div>
        <span className="text-[13px] font-medium">
          {formatUsDate(quest.quest_end_date)}
        </span>
      </div>
    </div>
  );
};
