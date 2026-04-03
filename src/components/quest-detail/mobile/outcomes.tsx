import { useOpinionBounty } from '@/hooks/use-opinion-bounty';
import { useQuestStatus } from '@/hooks/use-quest-status';
import type { QuestDetail } from '@/types/schema';
import { cn } from '@/utils/cn';
import { getBettingToken } from '@/utils/quest';

function formatNumber(num?: number) {
  if (num == null) {
    return '0';
  }
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(
    num,
  );
}

export const MobileOutcomes = ({ quest }: { quest: QuestDetail }) => {
  const isOpinionBounty = useOpinionBounty(quest);
  const totalBettingAmount = quest.total_betting_amount ?? 0;
  const bettingToken = getBettingToken(quest);
  const { status } = useQuestStatus(quest);

  const getBetPercent = (
    quest: QuestDetail,
    answer: { total_betting_amount: number; total_betting: number },
  ) => {
    if (isOpinionBounty) {
      return quest.total_betting > 0
        ? (answer.total_betting / quest.total_betting) * 100
        : 0;
    }

    return totalBettingAmount > 0
      ? (answer.total_betting_amount / totalBettingAmount) * 100
      : 0;
  };

  return (
    <div className="mt-4 border-b border-[#EEEEEE] pb-6">
      <div className="mb-2 text-[16px] font-bold">Outcomes</div>
      <div className="space-y-4">
        {quest.answers?.map((answer) => {
          const pct = getBetPercent(quest, answer);
          return (
            <div key={answer.answer_key} className="space-y-1">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'text-[14px] font-medium',
                    status !== 'ended' || answer.answer_selected
                      ? 'opacity-100 font-semibold'
                      : 'opacity-50',
                  )}
                >
                  {answer.answer_title}
                </span>
                <span
                  className={cn(
                    'text-[14px] font-medium text-black',
                    status !== 'ended' || answer.answer_selected
                      ? 'opacity-100 font-semibold'
                      : 'opacity-50',
                  )}
                >
                  {pct.toFixed(2)}
                  %
                  {' '}
                  {!isOpinionBounty
                    ? `(${formatNumber(answer.total_betting_amount)} ${bettingToken.symbol})`
                    : ''}
                </span>
              </div>
              <div className="h-2 w-full rounded-2xl bg-[#E9E6FF]">
                <div
                  className="h-2 rounded-2xl bg-[#3B27DF]"
                  style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
