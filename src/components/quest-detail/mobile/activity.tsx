import { useState } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Typography } from '@/components/ui/typography';
import type { BettingToken } from '@/config/constants';
import { useFetchQuestBettings } from '@/hooks/use-quest';
import type { QuestDetail } from '@/types/schema';
import { formatNumber } from '@/utils/number';
import { getBettingToken } from '@/utils/quest';
import { getExplorerUrl } from '@/utils/wallet';

export const MobileActivity = ({ quest }: { quest: QuestDetail }) => {
  const { data, isFetching } = useFetchQuestBettings(quest.quest_key);
  const bettingToken = getBettingToken(quest);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ScrollArea className="mt-5 h-[440px]">
      <button
        className="mb-3 flex cursor-pointer items-center gap-2 border-none bg-transparent p-0 text-left"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-expanded={isOpen}
      >
        <Typography level="h6" className="font-bold">
          Activity
        </Typography>
        <svg
          width="9"
          height="7"
          viewBox="0 0 9 7"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path
            d="M4.01226 1.13135C4.34039 0.775878 4.91461 0.775879 5.24273 1.13135L8.74273 4.63135C8.98883 4.87744 9.07086 5.26025 8.93414 5.58838C8.79742 5.9165 8.46929 6.13525 8.11383 6.13525L1.11383 6.13525C0.7857 6.13525 0.457576 5.9165 0.320857 5.58838C0.184138 5.26025 0.26617 4.87744 0.512263 4.63135L4.01226 1.13135Z"
            fill="#5E5E5E"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="space-y-3">
          {/* Header */}
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_0.5fr] gap-2 border-b pb-2">
            <Typography level="body2" className="font-semibold text-foreground">
              User
            </Typography>
            <Typography level="body2" className="font-semibold text-foreground">
              Answer
            </Typography>
            <Typography level="body2" className="font-semibold text-foreground">
              Amount
            </Typography>
            <Typography level="body2" className="font-semibold text-foreground">
              Date
            </Typography>
            <Typography level="body2" className="font-semibold text-foreground">
              Tx
            </Typography>
          </div>

          {/* Content */}
          {isFetching
            ? (
                <>
                  {[...Array(8)].map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="grid grid-cols-[1fr_1fr_1fr_1fr_0.5fr] gap-2"
                    >
                      <Skeleton className="h-4" />
                      <Skeleton className="h-4" />
                      <Skeleton className="h-4" />
                      <Skeleton className="h-4" />
                      <Skeleton className="h-4" />
                    </div>
                  ))}
                </>
              )
            : (
                data?.data?.map((betting) => {
                  const answer = quest.answers.find(
                    ans => ans.answer_key === String(betting.answer_key),
                  );
                  if (!answer) {
                    return null;
                  }

                  return (
                    <HistoryItem
                      key={betting.betting_key}
                      better={betting.betting_address}
                      answer={answer.answer_title}
                      bettingTx={betting.betting_tx ?? ''}
                      bettingAmount={betting.betting_amount}
                      bettingToken={bettingToken}
                      bettingDate={betting.betting_created_at}
                    />
                  );
                })
              )}
        </div>
      )}
    </ScrollArea>
  );
};

type HistoryItemProps = {
  better: string;
  answer: string;
  bettingTx: string;
  bettingAmount: string | number;
  bettingToken: BettingToken;
  bettingDate?: string;
};

const HistoryItem = ({
  better,
  answer,
  bettingAmount,
  bettingToken,
  bettingTx,
  bettingDate,
}: HistoryItemProps) => {
  const formattedDate = bettingDate
    ? new Date(bettingDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    : '-';

  return (
    <div className="grid grid-cols-[1fr_1fr_1fr_1fr_0.5fr] items-center gap-2 text-xs">
      <a
        target="_blank"
        href={getExplorerUrl('address', better)}
        rel="noreferrer"
      >
        <Typography
          level="caption"
          className="font-semibold text-secondary hover:underline"
          asChild
        >
          <span className="truncate">
            {better.slice(0, 8)}
            ...
          </span>
        </Typography>
      </a>

      <Typography level="caption" className="font-semibold" asChild>
        <span className="truncate">{answer}</span>
      </Typography>

      <Typography level="caption" className="font-semibold" asChild>
        <span className="truncate">
          {formatNumber(Number(bettingAmount), {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
          {' '}
          {bettingToken.symbol}
        </span>
      </Typography>

      <Typography level="caption" className="font-semibold" asChild>
        <span className="truncate">{formattedDate}</span>
      </Typography>

      <a
        target="_blank"
        href={getExplorerUrl('tx', bettingTx)}
        rel="noreferrer"
        className="flex items-center gap-1"
      >
        <Typography
          level="caption"
          className="font-semibold text-secondary hover:underline"
          asChild
        >
          <span className="truncate">
            {bettingTx.slice(0, 8)}
            ...
          </span>
        </Typography>
      </a>
    </div>
  );
};
