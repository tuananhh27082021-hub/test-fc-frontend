'use client';

import { waitForTransactionReceipt } from '@wagmi/core';
import { useState } from 'react';
import { parseEther } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FAST_TOKEN_ADDRESS, MARKET_MAP_TOKEN } from '@/config/constants';
import { fastTokenABI } from '@/config/contract';
import { storageKey } from '@/config/query';
import { wagmiConfig } from '@/config/wagmi';
import { useSessionStorage } from '@/hooks/use-storage';
import { useToast } from '@/hooks/use-toast';
import Api from '@/libs/api';
import type { AuthHeaderRequest } from '@/types/schema';

interface DistributeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  maxBalance: string;
  onSuccess: () => void;
}

export function DistributeModal({
  open,
  onOpenChange,
  maxBalance,
  onSuccess,
}: DistributeModalProps) {
  const { address } = useAccount();
  const { toast } = useToast();
  const [wallet, setWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [unlockDate, setUnlockDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const lockable = MARKET_MAP_TOKEN[FAST_TOKEN_ADDRESS]?.lockable ?? false;

  const [authHeaders] = useSessionStorage<AuthHeaderRequest | null>(
    storageKey.signedMessage,
    null,
  );

  const { writeContractAsync } = useWriteContract({
    config: wagmiConfig,
  });

  const handleDistribute = async () => {
    try {
      // Validation
      if (!wallet) {
        toast({
          title: 'Error',
          description: 'Please enter a wallet address',
          variant: 'danger',
        });
        return;
      }

      if (!amount || Number.parseFloat(amount) <= 0) {
        toast({
          title: 'Error',
          description: 'Please enter a valid amount',
          variant: 'danger',
        });
        return;
      }

      if (Number.parseFloat(amount) > Number.parseFloat(maxBalance)) {
        toast({
          title: 'Error',
          description: 'Amount exceeds balance',
          variant: 'danger',
        });
        return;
      }

      if (isLocked && !unlockDate) {
        toast({
          title: 'Error',
          description: 'Please select unlock date',
          variant: 'danger',
        });
        return;
      }

      setIsLoading(true);

      const amountInWei = parseEther(amount);

      let hash;
      if (isLocked) {
        // Convert datetime to Unix timestamp (UTC)
        const unlockTimestamp = Math.floor(
          new Date(unlockDate).getTime() / 1000,
        );

        hash = await writeContractAsync({
          address: FAST_TOKEN_ADDRESS,
          abi: fastTokenABI,
          functionName: 'transferWithLock',
          args: [wallet as `0x${string}`, amountInWei, BigInt(unlockTimestamp)],
        });
      } else {
        hash = await writeContractAsync({
          address: FAST_TOKEN_ADDRESS,
          abi: fastTokenABI,
          functionName: 'transfer',
          args: [wallet as `0x${string}`, amountInWei],
        });
      }

      // Wait for transaction
      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });

      if (receipt.status !== 'success') {
        throw new Error('An unexpected error has occurred');
      }

      // Call API to record distribution
      if (!authHeaders) {
        throw new Error('Authentication required');
      }

      try {
        await Api.createDistribution({
          sender: address!,
          receiver: wallet,
          amount,
          unlock_at: isLocked ? new Date(unlockDate).toISOString() : null,
          tx_hash: hash,
          message: authHeaders.message,
          signature: authHeaders.signature,
        });
      } catch (apiError) {
        console.error('Failed to record distribution in database:', apiError);
        toast({
          title: 'Warning',
          description: `Transaction successful (${hash}) but failed to record in database. Please contact admin.`,
          variant: 'warning',
        });
      }

      toast({
        title: 'Success',
        description: `Tokens distributed successfully. Hash: ${hash}`,
        variant: 'success',
      });

      // Reset form
      setWallet('');
      setAmount('');
      setIsLocked(false);
      setUnlockDate('');
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Distribute error:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to distribute tokens',
        variant: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Distribute Tokens</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="wallet">Wallet Address</Label>
            <Input
              id="wallet"
              placeholder="0x..."
              value={wallet}
              onChange={(e) => {
                setWallet(e.target.value);
              }}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.000001"
              placeholder="0.0"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
              }}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Max balance:
              {' '}
              {maxBalance}
            </p>
          </div>
          {lockable && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="lock"
                checked={isLocked}
                onCheckedChange={(checked) => {
                  setIsLocked(checked as boolean);
                }}
                disabled={isLoading}
              />
              <Label htmlFor="lock" className="cursor-pointer">
                Lock
              </Label>
            </div>
          )}
          {isLocked && (
            <div className="grid gap-2">
              <Label htmlFor="unlockDate">Unlock Date & Time</Label>
              <Input
                id="unlockDate"
                type="datetime-local"
                value={unlockDate}
                onChange={(e) => {
                  setUnlockDate(e.target.value);
                }}
                disabled={isLoading}
              />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleDistribute} disabled={isLoading}>
            {isLoading ? 'Distributing...' : 'Distribute'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
