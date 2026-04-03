'use client';

import { useState } from 'react';
import { formatUnits } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

import { DistributeHistoryTable } from '@/components/admin/distribute-history-table';
import { DistributeModal } from '@/components/admin/distribute-modal';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { FAST_TOKEN_ADDRESS } from '@/config/constants';
import { fastTokenABI } from '@/config/contract';

export default function DistributePage() {
  const { address } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: balance, refetch } = useReadContract({
    address: FAST_TOKEN_ADDRESS,
    abi: fastTokenABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: ownerAddress } = useReadContract({
    address: FAST_TOKEN_ADDRESS,
    abi: fastTokenABI,
    functionName: 'owner',
  });

  const isOwner
    = address
      && ownerAddress
      && address.toLowerCase() === (ownerAddress as string).toLowerCase();

  const formattedBalance = balance ? formatUnits(balance as bigint, 18) : '0';

  const handleDistributeSuccess = () => {
    refetch();
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-8 bg-background shadow-light">
        <div className="flex items-center justify-between px-12 py-10">
          <div>
            <Typography level="h4" className="font-bold">
              {formattedBalance}
              {' '}
              FAST
            </Typography>
            <p className="text-sm text-muted-foreground">
              {isOwner
                ? 'Available balance for distribution'
                : 'Only contract owner can distribute tokens'}
            </p>
          </div>
          <Button
            onClick={() => {
              setIsModalOpen(true);
            }}
            disabled={!address || !isOwner}
          >
            Distribute
          </Button>
        </div>
      </div>

      {address
        ? (
            <DistributeHistoryTable
              senderAddress={address}
              refreshKey={refreshKey}
            />
          )
        : (
            <div className="overflow-hidden rounded-8 bg-background shadow-light">
              <div className="px-12 py-10">
                <p className="text-center text-muted-foreground">
                  Connect wallet to view distribution history
                </p>
              </div>
            </div>
          )}

      <DistributeModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        maxBalance={formattedBalance}
        onSuccess={handleDistributeSuccess}
      />
    </div>
  );
}
