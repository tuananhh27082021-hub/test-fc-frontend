'use client';

import { CheckIcon } from 'lucide-react';
import { useState } from 'react';
import { useAccount } from 'wagmi';

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useGetMember } from '@/hooks/use-member';
import { formatNumber } from '@/utils/number';

import CopyIcon from '../ui/copy-icon';
import InfoIcon from '../ui/info-icon';
import { Skeleton } from '../ui/skeleton';
import { Typography } from '../ui/typography';

export const MobileBalanceCards = () => {
  const [showReferralTooltip, setShowReferralTooltip] = useState(false);
  const { address } = useAccount();

  const { data: memberData, isLoading: isLoadingMember } = useGetMember(address);

  const referralCode = (memberData?.data as any)?.referralCode
    ?? (memberData?.data as any)?.referral_code
    ?? 'N/A';

  const [copiedText, copy, setCopiedText] = useCopyToClipboard();

  if (isLoadingMember) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-[rgba(59,39,223,0.2)] bg-[rgba(59,39,223,0.04)] p-3">
          <Skeleton className="mb-2 h-3 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>

        <div className="rounded-xl border border-[rgba(59,39,223,0.2)] bg-[rgba(59,39,223,0.04)] p-3">
          <div className="mb-2 flex items-center gap-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="size-3" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="size-3" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-xl border border-[rgba(59,39,223,0.2)] bg-[rgba(59,39,223,0.04)] p-3">
        <Typography level="body2" className="mb-2 font-baloo-2 text-xs font-medium text-black">
          Forecast Points
        </Typography>
        <Typography level="h4" className="font-baloo-2 text-xl font-bold text-[#0B0916]">
          {formatNumber(Number(memberData?.data?.points ?? 0), {
            minimumFractionDigits: 0,
          })}
          {' '}
          FP
        </Typography>
      </div>

      <div className="relative rounded-xl border border-[rgba(59,39,223,0.2)] bg-[rgba(59,39,223,0.04)] p-3">
        <div className="mb-2 flex items-center gap-1">
          <Typography level="body2" className="font-baloo-2 text-xs font-medium text-black">
            Referral
          </Typography>
          <button
            type="button"
            onClick={() => setShowReferralTooltip(!showReferralTooltip)}
            className="size-3"
          >
            <InfoIcon size={12} color="#000000" />
          </button>
          {showReferralTooltip && (
            <div className="absolute left-1/2 top-full z-50 mt-0 w-[219px] -translate-x-1/2 rounded-lg bg-white p-2 shadow-[0px_2px_22px_0px_rgba(0,0,0,0.16)]" style={{ left: 'calc(50% - 30px)' }}>
              <div className="flex gap-1.5 p-1">
                <span className="text-sm text-[#3B27DF]">→</span>
                <span className="font-baloo-2 text-xs leading-[1.6] text-black">
                  Earn 100 FP when you create account
                </span>
              </div>
              <div className="flex gap-1.5 p-1">
                <span className="text-sm text-[#3B27DF]">→</span>
                <span className="font-baloo-2 text-xs leading-[1.6] text-black">
                  Earn 100 FP on your first voting, and the referrer receives 50 FP.
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Typography level="h4" className="font-baloo-2 text-xl font-semibold text-[#0B0916]">
            {referralCode}
          </Typography>
          <button
            type="button"
            aria-label="Copy referral link"
            onClick={() => {
              if (referralCode && referralCode !== 'N/A') {
                copy(`${window.location.origin}/?ref=${referralCode}`).then(() =>
                  setTimeout(() => setCopiedText(''), 1000),
                );
              }
            }}
            className="size-3"
          >
            {copiedText ? <CheckIcon size={12} /> : <CopyIcon size={12} color="#3B27DF" />}
          </button>
        </div>
      </div>
    </div>
  );
};
