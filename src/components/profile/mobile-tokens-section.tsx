'use client';

import Image from 'next/image';
import { useState } from 'react';

import { MARKET_MAP_TOKEN } from '@/config/constants';
import { useTokenBalance } from '@/hooks/use-contract';
// import { Env } from '@/libs/Env';
import { formatNumber } from '@/utils/number';

import { Skeleton } from '../ui/skeleton';
import { Typography } from '../ui/typography';

export const MobileTokensSection = () => {
  const [showAll, setShowAll] = useState(false);
  const tokens = Object.values(MARKET_MAP_TOKEN);

  // Call useTokenBalance for each token explicitly (React hook rules)
  // Assumes tokens is a small, static array
  const tokenBalances = tokens.map((token) => {
    // For each token, call useTokenBalance in a fixed order
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const balance = useTokenBalance(token.address, token.isNative);
    return {
      ...token,
      ...balance,
    };
  });

  const isLoadingAny = tokenBalances.some(t => t.isLoading);

  // Show only first 2 tokens by default, all if showAll is true
  const displayedTokens = showAll ? tokenBalances : tokenBalances.slice(0, 2);
  const hasMoreTokens = tokenBalances.length > 2;

  if (isLoadingAny) {
    return (
      <>
        <Typography
          level="body2"
          className="mb-3 font-baloo-2 text-base font-bold text-[#0B0916]"
        >
          Tokens
        </Typography>
        <div className="space-y-3 rounded-[13px] border border-[rgba(59,39,223,0.2)] bg-[rgba(59,39,223,0.08)] p-4">
          {displayedTokens.map((token, idx) => (
            <div
              className="flex items-center justify-between"
              key={token.symbol || idx}
            >
              <div className="flex items-center gap-[7px]">
                <Skeleton className="size-[34px] rounded-full" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <Typography
        level="body2"
        className="mb-3 font-baloo-2 text-base font-bold text-[#0B0916]"
      >
        Tokens
      </Typography>
      <div className="space-y-3 rounded-[13px] border border-[rgba(59,39,223,0.2)] bg-[rgba(59,39,223,0.08)] p-4">
        {displayedTokens.map((token, idx) => (
          <div
            className="flex items-center justify-between"
            key={token.symbol || idx}
          >
            <div className="flex items-center gap-[7px]">
              <Image
                src={token.iconUrl || '/assets/icons/boom-token-icon.png'}
                alt={token.name || token.symbol || 'Token'}
                width={34}
                height={34}
                className="rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="font-baloo-2 text-[14px] font-semibold leading-[1.4] text-black">
                  {token.name || token.symbol}
                </span>
                <span className="font-baloo-2 text-[12px] leading-[1.4] text-black">
                  {token.symbol}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-baloo-2 text-[14px] leading-[1.4] text-black">
                {formatNumber(Number(token.uiAmount), {
                  minimumFractionDigits: 3,
                })}
                {' '}
                {token.symbol}
              </span>
            </div>
          </div>
        ))}
        {hasMoreTokens && (
          <div className="flex items-center justify-center pt-1">
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="font-baloo-2 text-[14px] leading-[1.4] text-[#3B27DF]"
              aria-label={showAll ? 'View less tokens' : 'View more tokens'}
            >
              {showAll ? 'View less' : 'View more'}
            </button>
          </div>
        )}
      </div>
    </>
  );
};
