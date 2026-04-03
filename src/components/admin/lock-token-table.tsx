'use client';

import type { ColumnDef } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { formatUnits } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FAST_TOKEN_ADDRESS } from '@/config/constants';
import { fastTokenABI } from '@/config/contract';

interface LockInfo {
  amount: bigint;
  unlockTime: bigint;
}

const formatDate = (timestamp: bigint) => {
  return new Date(Number(timestamp) * 1000).toLocaleString();
};

const columns: ColumnDef<LockInfo>[] = [
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = row.getValue('amount') as bigint;
      return (
        <span>
          {formatUnits(amount, 18)}
          {' '}
          FAST
        </span>
      );
    },
  },
  {
    accessorKey: 'unlockTime',
    header: 'Unlock At',
    cell: ({ row }) => {
      const unlockTime = row.getValue('unlockTime') as bigint;
      return formatDate(unlockTime);
    },
  },
];

interface LockTokenTableProps {
  walletAddress?: string;
}

export function LockTokenTable({ walletAddress }: LockTokenTableProps) {
  const { address: connectedAddress } = useAccount();
  const addressToUse = walletAddress || connectedAddress;

  const {
    data: locks,
    isLoading,
    isSuccess,
    isError,
  } = useReadContract({
    address: FAST_TOKEN_ADDRESS,
    abi: fastTokenABI,
    functionName: 'getLocks',
    args: addressToUse ? [addressToUse] : undefined,
    query: {
      enabled: !!addressToUse,
    },
  });

  const locksList = (locks as LockInfo[]) || [];

  const table = useReactTable({
    data: locksList,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-8 bg-background">
      <ScrollArea className="h-[535px] px-12 pb-10">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading
              ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                )
              : isError
                ? (
                    <TableRow>
                      {columns.slice(1).map(col => (
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center text-red-500"
                          key={col.id}
                        />
                      ))}
                    </TableRow>
                  )
                : table.getRowModel().rows?.length
                  ? (
                      table.getRowModel().rows.map(row => (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && 'selected'}
                        >
                          {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )
                  : (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="h-24 text-center"
                        >
                          {isSuccess
                            ? 'No locked tokens found'
                            : 'Connect wallet to view locked tokens'}
                        </TableCell>
                      </TableRow>
                    )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
