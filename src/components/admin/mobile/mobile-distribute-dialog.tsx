'use client';

import { useState } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/ui/typography';
import { FAST_TOKEN_ADDRESS, MARKET_MAP_TOKEN } from '@/config/constants';
import { fastTokenABI } from '@/config/contract';
import { useToast } from '@/hooks/use-toast';
import api from '@/libs/api';

interface MobileDistributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MobileDistributeDialog({
  open,
  onOpenChange,
  onSuccess,
}: MobileDistributeDialogProps) {
  const { toast } = useToast();
  const { address } = useAccount();
  const [wallet, setWallet] = useState('');
  const [amount, setAmount] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [unlockDate, setUnlockDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const lockable = MARKET_MAP_TOKEN[FAST_TOKEN_ADDRESS]?.lockable ?? false;

  const { writeContractAsync } = useWriteContract();

  const { data: balance } = useReadContract({
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

  const handleDistribute = async () => {
    if (!wallet || !amount) {
      toast({
        title: 'Please fill in all required fields',
        variant: 'danger',
      });
      return;
    }

    if (isLocked && !unlockDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select unlock date',
        variant: 'danger',
      });
      return;
    }

    setIsLoading(true);

    try {
      const amountInWei = parseUnits(amount, 18);

      let hash;
      if (isLocked) {
        // Transfer with lock
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
        // Regular transfer
        hash = await writeContractAsync({
          address: FAST_TOKEN_ADDRESS,
          abi: fastTokenABI,
          functionName: 'transfer',
          args: [wallet as `0x${string}`, amountInWei],
        });
      }

      // Save to backend
      await api.createDistribution({
        sender: address!,
        receiver: wallet,
        amount,
        unlock_at: isLocked ? new Date(unlockDate).toISOString() : null,
        tx_hash: hash,
        message: '',
        signature: '',
      });

      toast({
        title: 'Success',
        description: 'Tokens distributed successfully',
        variant: 'success',
      });

      onSuccess?.();
      onOpenChange(false);
      setWallet('');
      setAmount('');
      setIsLocked(false);
      setUnlockDate('');
    } catch (error: any) {
      console.error('Distribute error:', error);
      toast({
        title: 'Distribution Failed',
        description:
          error?.shortMessage
          || error?.message
          || 'Failed to distribute tokens',
        variant: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOwner && address) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-11/12 max-w-md">
          <DialogHeader>
            <DialogTitle>Distribute Tokens</DialogTitle>
            <DialogDescription className="sr-only">
              Distribute FAST tokens
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Only contract owner can distribute tokens
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-11/12 max-w-md">
        <DialogHeader>
          <DialogTitle>Distribute Tokens</DialogTitle>
          <DialogDescription className="sr-only">
            Distribute FAST tokens
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Balance Display */}
          <div className="rounded-lg bg-gray-50 p-3">
            <Typography level="body2" className="text-xs text-gray-600">
              Available Balance
            </Typography>
            <Typography level="body1" className="font-bold">
              {formattedBalance}
              {' '}
              FAST
            </Typography>
          </div>

          {/* Wallet Address */}
          <div className="space-y-2">
            <Label htmlFor="wallet" className="text-sm">
              Wallet Address
            </Label>
            <Input
              id="wallet"
              placeholder="0x..."
              value={wallet}
              onChange={e => setWallet(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm">
              Amount (FAST)
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Lock Option */}
          {lockable && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="lock"
                checked={isLocked}
                onChange={e => setIsLocked(e.target.checked)}
                className="size-4 rounded border-gray-300"
              />
              <Label htmlFor="lock" className="text-sm">
                Lock
              </Label>
            </div>
          )}

          {/* Unlock Date */}
          {isLocked && (
            <div className="space-y-2">
              <Label htmlFor="unlockDate" className="text-sm">
                Unlock Date
              </Label>
              <Input
                id="unlockDate"
                type="datetime-local"
                value={unlockDate}
                onChange={e => setUnlockDate(e.target.value)}
                className="text-sm"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleDistribute}
            disabled={isLoading || !address}
            className="w-full border-0"
            noShadow
          >
            {isLoading ? 'Distributing...' : 'Distribute'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
