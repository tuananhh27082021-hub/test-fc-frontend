'use client';

import { useAccount } from 'wagmi';

import { useTokenBalance } from '@/hooks/use-contract';
import { useGetMember } from '@/hooks/use-member';
import { Env } from '@/libs/Env';
import { isAdmin } from '@/utils/member';

import AdminTableWithWrapper from '../admin/mobile-admin-table';
import { Skeleton } from '../ui/skeleton';
import { MobileAccountHeader } from './mobile-account-header';
import { MobileActionButtons } from './mobile-action-buttons';
import { MobileActivitiesSection } from './mobile-activities-section';
import { MobileBalanceCards } from './mobile-balance-cards';
import { MobileTokensSection } from './mobile-tokens-section';

export const AccountCardMobile = () => {
  const { address } = useAccount();
  const { data: memberData } = useGetMember(address);
  const { isLoading: isLoadingBetting } = useTokenBalance(
    Env.NEXT_PUBLIC_BETTING_TOKEN_ADDRESS,
  );

  const { isLoading: isLoadingPoint } = useTokenBalance(
    Env.NEXT_PUBLIC_POINT_TOKEN_ADDRESS,
  );

  const userInfo = (memberData?.data || {}) as any;
  const isUserAdmin = isAdmin(userInfo);

  if (isLoadingPoint || isLoadingBetting) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MobileAccountHeader />
      <MobileBalanceCards />
      <MobileActionButtons />
      <MobileTokensSection />
      <MobileActivitiesSection />
      {isUserAdmin && (
        <AdminTableWithWrapper key={userInfo?.role} status="ongoing" />
      )}
    </div>
  );
};
