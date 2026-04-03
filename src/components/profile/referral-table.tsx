'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';

import { DataTable } from '@/components/ui/data-table';
import { useDataTable } from '@/hooks/use-data-table';
import {
  useGetMemberReferrals,
} from '@/hooks/use-member';
import type { Referral } from '@/types/schema';
import { shortenAddress } from '@/utils/wallet';

import { Skeleton } from '../ui/skeleton';

function getColumns(): ColumnDef<Referral>[] {
  return [
    {
      header: 'User',
      cell: ({ row }) => {
        return (
          <span>{shortenAddress(row.original.invitee.wallet_address)}</span>
        );
      },
    },
    {
      header: 'Points',
      cell: ({ row }) => {
        return <span>{row.original.total_points}</span>;
      },
    },
  ];
}

export const ReferralTable = () => {
  const { address } = useAccount();
  const { data, isLoading } = useGetMemberReferrals(address!);

  const columns = useMemo(() => {
    const cols = getColumns();

    return isLoading
      ? cols.map(column => ({
        ...column,
        cell: () => <Skeleton className="h-4 w-16" />,
      }))
      : cols;
  }, [isLoading, getColumns]);

  const { table } = useDataTable({
    data: (data?.data ?? []) as Referral[],
    columns,
    pageCount: -1,
    getRowId: (originalRow: Referral) =>
      `${originalRow.invitee.wallet_address}`,
  });

  return <DataTable table={table} />;
};
