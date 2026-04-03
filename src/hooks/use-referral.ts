'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const CACHED_REFERRAL_KEY = 'ref';

export function useReferral() {
  const searchParams = useSearchParams();
  const [referralCode, setReferralCode] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(CACHED_REFERRAL_KEY) || undefined;
    }
    return undefined;
  });

  useEffect(() => {
    const refCode = searchParams.get('ref');

    if (refCode && refCode !== referralCode) {
      setReferralCode(refCode);
      localStorage.setItem(CACHED_REFERRAL_KEY, refCode);
    }
  }, [searchParams, referralCode]);

  return { referralCode };
}

export const getReferralCode = () =>
  localStorage.getItem(CACHED_REFERRAL_KEY) || undefined;
