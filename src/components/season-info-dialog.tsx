'use client';

import type { PropsWithChildren } from 'react';
import React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useGetTokenInfo } from '@/hooks/use-contract';
import { useFetchActiveSeason } from '@/hooks/use-seasons';
import { Env } from '@/libs/Env';
import { formatNumber } from '@/utils/number';

import { Skeleton } from './ui/skeleton';
import { Typography } from './ui/typography';

type SeasonInfoDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} & PropsWithChildren;

export default function SeasonInfoDialog({
  children,
  open,
  onOpenChange,
}: SeasonInfoDialogProps) {
  const { data, isFetching } = useFetchActiveSeason();

  const { symbol } = useGetTokenInfo(Env.NEXT_PUBLIC_BETTING_TOKEN_ADDRESS);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-11/12">
        <DialogHeader className="mb-6">
          <DialogTitle>{data?.data?.title}</DialogTitle>
          <DialogDescription className="sr-only">
            Forecast Season Info
          </DialogDescription>
        </DialogHeader>

        {isFetching
          ? (
              <div className="rounded-3xl">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4"
                  >
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            )
          : (
              <div className="divide-y rounded-3xl bg-[#F5F5F5]">
                <div className="flex items-center justify-between gap-4 p-4">
                  <Typography level="body2">Prediction Fee:</Typography>
                  <Typography className="font-medium" level="body2">
                    {formatNumber(data?.data?.serviceFee ?? 0, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 1,
                    })}
                    %
                  </Typography>
                </div>
                <div className="flex items-center justify-between gap-4 p-4">
                  <Typography level="body2">Forecast Fee:</Typography>
                  <Typography className="font-medium" level="body2">
                    {formatNumber(data?.data?.creatorFee ?? 0, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 1,
                    })}
                    %
                  </Typography>
                </div>
                <div className="flex items-center justify-between gap-4 p-4">
                  <Typography level="body2">Charity Fee:</Typography>
                  <Typography className="font-medium" level="body2">
                    {formatNumber(data?.data?.charityFee ?? 0, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 1,
                    })}
                    %
                  </Typography>
                </div>
                <div className="flex items-center justify-between gap-4 p-4">
                  <Typography level="body2">Minimum Vote:</Typography>
                  <Typography className="font-medium" level="body2">
                    {formatNumber(data?.data?.minPay ?? 0, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}
                    {' '}
                    {symbol}
                  </Typography>
                </div>
              </div>
            )}
      </DialogContent>
    </Dialog>
  );
}
