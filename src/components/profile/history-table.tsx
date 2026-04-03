'use client';

import type { CellContext, ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { CheckIcon } from 'lucide-react';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';

import { DataTable } from '@/components/ui/data-table';
import { OPINION_BOUNTY_CATEGORY } from '@/config/constants';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useDataTable } from '@/hooks/use-data-table';
import { useGetMemberBettings } from '@/hooks/use-member';
import { CopyIcon } from '@/icons/icons';
import { Env } from '@/libs/Env';
import type { MemberBetting } from '@/types/schema';
import { formatNumber } from '@/utils/number';
import { getBettingToken } from '@/utils/quest';
import { maskWalletAddress } from '@/utils/wallet';

import { Skeleton } from '../ui/skeleton';
import { Typography } from '../ui/typography';

function getColumns(): ColumnDef<MemberBetting>[] {
  return [
    {
      header: 'Spender Address',
      cell: SpenderCell,
    },
    {
      header: 'Recipient Address',
      cell: RecipientAddressCell,
    },
    {
      header: 'Amount',
      cell: ({ row }) => {
        const quest = row.original.quest;
        const symbol
          = quest?.quest_category?.quest_category_title
          === OPINION_BOUNTY_CATEGORY
            ? 'Points'
            : getBettingToken(quest).symbol;

        const amount = row.original.reward_claimed
          ? row.original.reward_amount
          : row.original.betting_amount;

        return `${formatNumber(amount, {
          minimumFractionDigits: 0,
        })} ${symbol}`;
      },
    },
    {
      header: 'Create DTTM',
      cell: ({ row }) => {
        return dayjs(row.original.betting_created_at).format(
          'YYYY/MM/DD | hh:mm',
        );
      },
    },
  ];
}

const SpenderCell = ({ row }: CellContext<MemberBetting, unknown>) => {
  const [copiedText, copy, setCopiedText] = useCopyToClipboard();

  let content = '';
  if (row.original.reward_claimed) {
    content = Env.NEXT_PUBLIC_MARKET_ADDRESS;
  } else {
    content = row.original.betting_address;
  }

  return (
    <div className="flex items-center gap-2">
      <Typography level="body2" className="font-medium md:text-base">
        {maskWalletAddress(content)}
      </Typography>
      <button
        type="button"
        onClick={() => {
          if (content) {
            copy(content).then(() =>
              setTimeout(() => {
                setCopiedText('');
              }, 1000),
            );
          }
        }}
        className="size-6"
      >
        {copiedText
          ? (
              <CheckIcon />
            )
          : (
              <CopyIcon className="size-6 text-foreground-50" />
            )}
      </button>
    </div>
  );
};

const RecipientAddressCell = ({ row }: CellContext<MemberBetting, unknown>) => {
  const [copiedText, copy, setCopiedText] = useCopyToClipboard();

  let content = '';
  if (row.original.reward_claimed) {
    content = row.original.betting_address;
  } else {
    content = Env.NEXT_PUBLIC_MARKET_ADDRESS;
  }

  return (
    <div className="flex items-center gap-2">
      <Typography level="body2" className="font-medium md:text-base">
        {maskWalletAddress(content)}
      </Typography>
      <button
        onClick={() => {
          if (content) {
            copy(content).then(() =>
              setTimeout(() => {
                setCopiedText('');
              }, 1000),
            );
          }
        }}
        className="size-6"
      >
        {copiedText
          ? (
              <CheckIcon />
            )
          : (
              <CopyIcon className="size-6 text-foreground-50" />
            )}
      </button>
    </div>
  );
};

export const HistoryTable = () => {
  const { address } = useAccount();
  const { data, isLoading } = useGetMemberBettings(address!);

  const columns = useMemo(() => {
    const cols = getColumns();

    return isLoading
      ? cols.map(column => ({
        ...column,
        cell: () => <Skeleton className="h-4 w-16" />,
      }))
      : cols;
  }, [isLoading]);

  const quests = useMemo(
    () =>
      isLoading
        ? Array.from({ length: 10 }).map((_, idx) => ({
          betting_key: String(Date.now() + idx),
        }))
        : (data?.data ?? []).filter(
            (item: MemberBetting) =>
              item.quest.quest_status === 'MARKET_SUCCESS',
          ),
    [isLoading, data],
  ) as MemberBetting[];

  const { table } = useDataTable({
    data: quests,
    columns,
    pageCount: -1,
    initialState: {
      sorting: [{ id: 'betting_created_at', desc: true }],
    },
    getRowId: (originalRow: MemberBetting) => `${originalRow.betting_key}`,
  });

  return <DataTable table={table} />;
};
