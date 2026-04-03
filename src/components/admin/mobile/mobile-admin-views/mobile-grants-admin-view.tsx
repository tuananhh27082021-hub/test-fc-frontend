'use client';

import * as Switch from '@radix-ui/react-switch';
import { useCallback, useEffect, useState } from 'react';

import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import { storageKey } from '@/config/query';
import { useSessionStorage } from '@/hooks/use-storage';
import Api from '@/libs/api';
import type { AuthHeaderRequest } from '@/types/schema';

import { Skeleton } from '../../../ui/skeleton';

interface MemberData {
  id: number;
  wallet: string;
  role: 'ADMIN' | 'USER';
}

const MobileRoleSwitch = ({
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
    <Switch.Root
      checked={isAdmin}
      onCheckedChange={handleToggle}
      disabled={isLoading}
      className="relative h-[18px] w-[32px] cursor-default rounded-full bg-gray-300 shadow-sm outline-none focus:shadow-[0_0_0_2px] focus:shadow-blue-500 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#3B27DF]"
      style={{ WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)' }}
    >
      <Switch.Thumb className="block size-[14px] translate-x-0.5 rounded-full bg-white shadow-sm transition-transform duration-100 will-change-transform data-[state=checked]:translate-x-[15px]" />
    </Switch.Root>
  );
};

export const MobileGrantsAdminView = () => {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingWallet, setUpdatingWallet] = useState<string | null>(null);

  const [authHeaders] = useSessionStorage<AuthHeaderRequest | null>(
    storageKey.signedMessage,
    null,
  );

  const fetchMembers = useCallback(
    async (pageNum: number) => {
      if (!authHeaders) {
        return;
      }

      setIsLoading(true);
      try {
        const response = await Api.getALlMembers(
          {
            page: pageNum,
            size: DEFAULT_PAGE_SIZE,
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
    },
    [authHeaders],
  );

  useEffect(() => {
    fetchMembers(page);
  }, [page, fetchMembers]);

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
      fetchMembers(page);
    } finally {
      setUpdatingWallet(null);
    }
  };

  return (
    <>
      {/* Table Header */}
      <div className="mb-2 flex gap-x-2 px-1 text-[10px] font-medium text-black/50">
        <span className="flex-1 pl-2">Wallet</span>
        <span className="w-12 text-center">Role</span>
        <span className="w-12 text-center">Action</span>
      </div>

      {/* Table Content */}
      {isLoading
        ? (
            <div className="space-y-2">
              {['a', 'b', 'c', 'd', 'e'].map(key => (
                <div key={key}>
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          )
        : (
            <div className="space-y-2">
              {members.length > 0
                ? (
                    members.map(member => (
                      <div
                        key={member.id}
                        className="flex items-center gap-x-2 rounded-md py-1 text-[10px]"
                      >
                        <span className="flex-1 truncate pl-2 font-mono text-black">
                          {member.wallet}
                        </span>
                        <span
                          className={`w-12 text-center font-medium ${
                            member.role === 'ADMIN' ? 'text-[#3B27DF]' : 'text-black/70'
                          }`}
                        >
                          {member.role}
                        </span>
                        <div className="flex w-12 justify-center">
                          <MobileRoleSwitch
                            initialRole={member.role}
                            wallet={member.wallet}
                            onRoleChange={handleRoleChange}
                            isLoading={updatingWallet === member.wallet}
                          />
                        </div>
                      </div>
                    ))
                  )
                : (
                    <div className="py-4 text-center">
                      <span className="font-baloo-2 text-[12px] text-black/50">
                        No members found
                      </span>
                    </div>
                  )}
            </div>
          )}

      {/* Pagination */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <button
          type="button"
          aria-label="Previous page"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          className="rounded-md bg-[#3B27DF] px-2 py-1 text-white disabled:opacity-40"
          disabled={page <= 1 || isLoading}
        >
          ‹
        </button>
        <span className="font-baloo-2 text-xs text-black">
          {page}
          {' '}
          /
          {totalPages}
        </span>
        <button
          type="button"
          aria-label="Next page"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          className="rounded-md bg-[#3B27DF] px-2 py-1 text-white disabled:opacity-40"
          disabled={page >= totalPages || isLoading}
        >
          ›
        </button>
      </div>
    </>
  );
};
