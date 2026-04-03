import dayjs from 'dayjs';
import { ExternalLinkIcon } from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Typography } from '@/components/ui/typography';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useFetchQuestBettings } from '@/hooks/use-quest';
import type { MemberBetting, QuestDetail } from '@/types/schema';
import { formatCurrency } from '@/utils/number';
import { getBettingToken } from '@/utils/quest';
import {
  getExplorerUrl,
  maskWalletAddress,
  truncateSignature,
} from '@/utils/wallet';

import { Skeleton } from '../ui/skeleton';

const SKELETON_ROWS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'];

export const HistoryTab = ({ quest }: { quest: QuestDetail }) => {
  const { data, isFetching } = useFetchQuestBettings(quest.quest_key);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const bettings = data?.data?.filter((betting) => {
    const answer = quest.answers.find(
      ans => ans.answer_key === String(betting.answer_key),
    );
    return !!answer;
  }) ?? [];

  if (isMobile) {
    return (
      <HistoryTabMobile
        quest={quest}
        bettings={bettings}
        isFetching={isFetching}
      />
    );
  }

  return (
    <ScrollArea className="h-[440px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Answer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Tx</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isFetching
            ? (
                <>
                  {SKELETON_ROWS.map(key => (
                    <TableRow key={key}>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    </TableRow>
                  ))}
                </>
              )
            : (
                bettings.map((betting) => {
                  const answer = quest.answers.find(
                    ans => ans.answer_key === String(betting.answer_key),
                  );
                  const token = getBettingToken(quest);

                  return (
                    <TableRow key={betting.betting_key}>
                      <TableCell>
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={getExplorerUrl('address', betting.betting_address)}
                          className="text-secondary hover:underline"
                        >
                          {maskWalletAddress(betting.betting_address)}
                        </a>
                      </TableCell>
                      <TableCell>
                        <Typography level="body2" className="font-medium">
                          {answer?.answer_title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography level="body2" className="font-medium">
                          {formatCurrency(Number(betting.betting_amount))}
                          {' '}
                          {token.symbol}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography level="body2" className="text-foreground-70">
                          {betting.betting_created_at
                            ? dayjs(betting.betting_created_at).format('DD-MM-YYYY')
                            : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={getExplorerUrl('tx', betting.betting_tx ?? '')}
                          className="flex items-center gap-1 text-secondary hover:underline"
                        >
                          <span>{truncateSignature(betting.betting_tx ?? '')}</span>
                          <ExternalLinkIcon className="size-4" />
                        </a>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

type HistoryTabMobileProps = {
  quest: QuestDetail;
  bettings: MemberBetting[];
  isFetching: boolean;
};

const HistoryTabMobile = ({ quest, bettings, isFetching }: HistoryTabMobileProps) => {
  return (
    <ScrollArea className="h-[440px]">
      <div className="space-y-3 pr-2">
        {isFetching
          ? (
              <>
                {SKELETON_ROWS.map(key => (
                  <div key={key} className="border-border/20 rounded-lg border p-3">
                    <Skeleton className="mb-2 h-4 w-full" />
                    <Skeleton className="mb-2 h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </>
            )
          : (
              bettings.map((betting) => {
                const answer = quest.answers.find(
                  ans => ans.answer_key === String(betting.answer_key),
                );
                const token = getBettingToken(quest);

                return (
                  <div
                    key={betting.betting_key}
                    className="border-border/20 rounded-lg border bg-gray-50 p-3"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={getExplorerUrl('address', betting.betting_address)}
                        className="text-sm font-medium text-secondary hover:underline"
                      >
                        {maskWalletAddress(betting.betting_address)}
                      </a>
                      <span className="text-xs text-foreground-70">
                        {betting.betting_created_at
                          ? dayjs(betting.betting_created_at).format('DD-MM-YYYY')
                          : '-'}
                      </span>
                    </div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-foreground-70">Answer:</span>
                      <span className="font-medium">{answer?.answer_title}</span>
                    </div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-foreground-70">Amount:</span>
                      <span className="font-medium">
                        {formatCurrency(Number(betting.betting_amount))}
                        {' '}
                        {token.symbol}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground-70">Tx:</span>
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={getExplorerUrl('tx', betting.betting_tx ?? '')}
                        className="flex items-center gap-1 text-secondary hover:underline"
                      >
                        <span>{truncateSignature(betting.betting_tx ?? '')}</span>
                        <ExternalLinkIcon className="size-3" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
      </div>
    </ScrollArea>
  );
};
