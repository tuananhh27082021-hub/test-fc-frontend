'use client';

import type { ColumnDef } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
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
import { storageKey } from '@/config/query';
import { useSessionStorage } from '@/hooks/use-storage';
import Api from '@/libs/api';
import type { AuthHeaderRequest, Distribution } from '@/types/schema';

interface DistributeHistoryTableProps {
  senderAddress: string;
  refreshKey: number;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

const columns: ColumnDef<Distribution>[] = [
  {
    accessorKey: 'receiver',
    header: 'Wallet Address',
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue('receiver')}</span>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => {
      const amount = row.getValue('amount') as string;
      return (
        <span>
          {Number.parseFloat(amount).toFixed(0)}
          {' '}
          FAST
        </span>
      );
    },
  },
  {
    accessorKey: 'unlockAt',
    header: 'Unlock At',
    cell: ({ row }) => {
      const unlockAt = row.getValue('unlockAt') as string | null;
      return unlockAt ? formatDate(unlockAt) : 'No lock';
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Distribute At',
    cell: ({ row }) => formatDate(row.getValue('createdAt')),
  },
];

export function DistributeHistoryTable({
  senderAddress,
  refreshKey,
}: DistributeHistoryTableProps) {
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [authHeaders] = useSessionStorage<AuthHeaderRequest | null>(
    storageKey.signedMessage,
    null,
  );

  const table = useReactTable({
    data: distributions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    const fetchDistributions = async () => {
      if (!senderAddress || !authHeaders) {
        return;
      }

      setIsLoading(true);
      try {
        const response = await Api.getDistributions(senderAddress, {
          page,
          message: authHeaders.message,
          signature: authHeaders.signature,
        });

        if (response.success && response.data) {
          setDistributions(response.data.distributions || []);
          setTotalPages(response.data.totalPages || 1);
        }
      } catch (error) {
        console.error('Failed to fetch distributions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDistributions();
  }, [senderAddress, page, refreshKey, authHeaders]);

  return (
    <div className="overflow-hidden rounded-8 bg-background shadow-light">
      <div className="flex px-12 py-10">
        <div className="flex items-center gap-6">
          <Typography level="h4">Distribution History</Typography>
        </div>
      </div>

      <ScrollArea className="h-[535px] px-12">
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
                        No distributions found
                      </TableCell>
                    </TableRow>
                  )}
          </TableBody>
        </Table>
      </ScrollArea>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 px-12 pb-10">
          <Button
            variant="outline"
            onClick={() => {
              setPage(p => Math.max(1, p - 1));
            }}
            disabled={page === 1 || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page
            {' '}
            {page}
            {' '}
            of
            {' '}
            {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => {
              setPage(p => Math.min(totalPages, p + 1));
            }}
            disabled={page === totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
