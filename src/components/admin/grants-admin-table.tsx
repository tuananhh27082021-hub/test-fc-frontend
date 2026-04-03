'use client';

import * as Switch from '@radix-ui/react-switch';
import type { ColumnDef } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import { storageKey } from '@/config/query';
import { useSessionStorage } from '@/hooks/use-storage';
import Api from '@/libs/api';
import type { AuthHeaderRequest } from '@/types/schema';

interface MemberData {
  id: number;
  wallet: string;
  role: 'ADMIN' | 'USER';
}

const RoleSwitch = ({
  initialRole,
  wallet,
  onRoleChange,
  isLoading,
}: {
  initialRole: 'ADMIN' | 'USER';
  wallet: string;
  onRoleChange: (wallet: string, newRole: 'ADMIN' | 'USER') => void;
  isLoading: boolean;
}) => {
  const isAdmin = initialRole === 'ADMIN';

  const handleToggle = (checked: boolean) => {
    const newRole = checked ? 'ADMIN' : 'USER';
    onRoleChange(wallet, newRole);
  };

  return (
    <div className="flex items-center gap-2">
      <Switch.Root
        checked={isAdmin}
        onCheckedChange={handleToggle}
        disabled={isLoading}
        className="relative h-[24px] w-[44px] cursor-default rounded-full bg-gray-300 shadow-sm outline-none focus:shadow-[0_0_0_2px] focus:shadow-blue-500 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue-600"
        style={{ WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)' }}
      >
        <Switch.Thumb className="block size-[20px] translate-x-0.5 rounded-full bg-white shadow-sm transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[21px]" />
      </Switch.Root>
      <span className="text-sm">{isAdmin ? 'Admin' : 'User'}</span>
    </div>
  );
};

export type GrantType = {
  wallet: string;
  role: 'ADMIN' | 'USER';
};

const columns: ColumnDef<GrantType>[] = [
  {
    accessorKey: 'wallet',
    header: 'Wallet Address',
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue('wallet')}</span>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as 'ADMIN' | 'USER';
      return (
        <span className={role === 'ADMIN' ? 'font-semibold text-blue-600' : ''}>
          {role}
        </span>
      );
    },
  },
];

export default function GrantsTableWrapper() {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingWallet, setUpdatingWallet] = useState<string | null>(null);

  const [authHeaders] = useSessionStorage<AuthHeaderRequest | null>(
    storageKey.signedMessage,
    null,
  );

  const fetchMembers = async (pageNum: number, query: string) => {
    if (!authHeaders) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await Api.getALlMembers(
        {
          page: pageNum,
          size: DEFAULT_PAGE_SIZE,
          query: query || undefined,
        },
        authHeaders,
      );

      if (response.success && response.data) {
        const membersList = (response.data.members || []).map(member => ({
          id: member.id,
          wallet: member.walletAddress,
          role: member.role,
        }));

        setMembers(membersList);
        const total = response.data.total || 0;
        setTotalPages(Math.ceil(total / DEFAULT_PAGE_SIZE));
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchMembers(1, searchQuery);
  }, [searchQuery, authHeaders]);

  useEffect(() => {
    if (page !== 1) {
      fetchMembers(page, searchQuery);
    }
  }, [page]);

  const handleRoleChange = async (
    wallet: string,
    newRole: 'ADMIN' | 'USER',
  ) => {
    if (!authHeaders) {
      return;
    }

    setUpdatingWallet(wallet);
    try {
      const response = await Api.updateMemberRole(
        {
          wallet_address: wallet,
          role: newRole,
        },
        authHeaders,
      );

      if (response.success) {
        // Update local state
        setMembers(prev =>
          prev.map(member =>
            member.wallet === wallet ? { ...member, role: newRole } : member,
          ),
        );
      }
    } catch (error) {
      console.error('Failed to update member role:', error);
      // Revert role on error
      fetchMembers(page, searchQuery);
    } finally {
      setUpdatingWallet(null);
    }
  };

  const columnsWithActions: ColumnDef<GrantType>[] = [
    ...columns,
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => {
        const wallet = row.original.wallet;
        const role = row.original.role;
        return (
          <RoleSwitch
            initialRole={role}
            wallet={wallet}
            onRoleChange={handleRoleChange}
            isLoading={updatingWallet === wallet}
          />
        );
      },
    },
  ];

  const table = useReactTable({
    data: members,
    columns: columnsWithActions,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-8 bg-background shadow-light">
      <div className="flex px-12 py-10">
        <Typography level="h4">Grants Admin</Typography>
      </div>

      <div className="px-12 pb-6">
        <Input
          placeholder="Search wallet address..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          disabled={isLoading}
          className="h-10 max-w-md"
        />
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
            {table.getRowModel().rows?.length
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
                      colSpan={columnsWithActions.length}
                      className="h-24 text-center"
                    >
                      No members found
                    </TableCell>
                  </TableRow>
                )}
          </TableBody>
        </Table>
      </ScrollArea>

      <div className="px-12 py-6">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => {
                  setPage(p => Math.max(1, p - 1));
                }}
                className={
                  page === 1 || isLoading
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
            <PaginationItem>
              <span className="text-sm">
                Page
                {' '}
                {page}
                {' '}
                of
                {' '}
                {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => {
                  setPage(p => Math.min(totalPages, p + 1));
                }}
                className={
                  page === totalPages || isLoading
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
