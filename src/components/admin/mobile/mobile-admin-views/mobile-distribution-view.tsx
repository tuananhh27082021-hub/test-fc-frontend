'use client';

import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { storageKey } from '@/config/query';
import { useSessionStorage } from '@/hooks/use-storage';
import Api from '@/libs/api';
import type { AuthHeaderRequest, Distribution } from '@/types/schema';

import { Skeleton } from '../../../ui/skeleton';

const formatAmount = (amount: string) => {
  return Number.parseFloat(amount).toFixed(0);
};

export const MobileDistributionView = () => {
  const { address } = useAccount();
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [authHeaders] = useSessionStorage<AuthHeaderRequest | null>(
    storageKey.signedMessage,
    null,
  );

  useEffect(() => {
    const fetchDistributions = async () => {
      if (!address || !authHeaders) {
        return;
      }

      setIsLoading(true);
      try {
        const response = await Api.getDistributions(address, {
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
  }, [address, page, authHeaders]);

  return (
    <>
      <div className="mb-2 flex gap-x-2 px-1 text-[10px] font-medium text-black/50">
        <span className="w-32">Wallet</span>
        <span className="w-14 text-center">Amount</span>
        <span className="w-21 flex-1 pl-4">Unlock At</span>
        <span className="w-21 text-center">Distribute At</span>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {['a', 'b', 'c', 'd', 'e'].map(key => (
            <div key={key}>
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && distributions.length > 0 && (
        <div className="space-y-2">
          {distributions.map(distribution => (
            <div
              key={`${distribution.receiver}-${distribution.createdAt}`}
              className="flex items-center gap-x-2 text-[10px]"
            >
              <span className="w-32 truncate text-black">
                {distribution.receiver}
              </span>
              <span className="w-14 text-center text-black">
                {formatAmount(distribution.amount)}
                {' '}
                FAST
              </span>
              <span className="w-21 flex-1 truncate text-black">
                {distribution.unlockAt
                  ? dayjs(distribution.unlockAt).format('YYYY/MM/DD HH:mm')
                  : 'No lock'}
              </span>
              <span className="w-21 text-center text-black">
                {dayjs(distribution.createdAt).format('YYYY/MM/DD HH:mm')}
              </span>
            </div>
          ))}
        </div>
      )}

      {!isLoading && distributions.length === 0 && (
        <div className="py-4 text-center text-[10px] text-black/50">
          No distributions found
        </div>
      )}

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
