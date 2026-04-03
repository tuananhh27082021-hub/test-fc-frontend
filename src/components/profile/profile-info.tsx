'use client';

import { usePrivy } from '@privy-io/react-auth';
import dayjs from 'dayjs';
import { CheckIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { CustomBreadcrumb } from '@/components/ui/breadcrumb';
import { Typography } from '@/components/ui/typography';
import { useTokenBalance } from '@/hooks/use-contract';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  useClaimDailyRewardMutation,
  useGetDailyReward,
  useGetMember,
} from '@/hooks/use-member';
import { useToast } from '@/hooks/use-toast';
import { CopyIcon, HomeSolidIcon } from '@/icons/icons';
import api from '@/libs/api';
import { Env } from '@/libs/Env';
import { cn } from '@/utils/cn';
import { formatNumber } from '@/utils/number';
import { shortenAddress } from '@/utils/wallet';

import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { AccountCardMobile } from './account-card-mobile';
import ReferralCard from './referral-card';

const breadcrumbItems = [
  { label: 'Homepage', href: '/', icon: <HomeSolidIcon /> },
];

export const ProfileInfo = () => {
  const { address } = useAccount();
  const [copiedText, copy, setCopiedText] = useCopyToClipboard();
  const sm = useMediaQuery('(min-width: 640px)');

  return (
    <div className="rounded-b-xl bg-white pb-6 md:bg-secondary-4 md:px-4">
      <div className="app-container md:pb-14 md:pt-8">
        {!sm
          ? (
              <AccountCardMobile />
            )
          : (
              <div className="flex flex-col md:flex-row md:justify-between">
                <div className="py-10 md:pb-10 md:pt-8 lg:py-0">
                  <div className="mb-8 inline-block rounded-2xl border border-border bg-white px-6 py-3.5 lg:mb-14">
                    <CustomBreadcrumb
                      items={breadcrumbItems}
                      currentPage="My Account"
                    />
                  </div>

                  <Typography
                    asChild
                    level="h4"
                    className="mb-4 font-clash-display font-semibold md:text-[40px]"
                  >
                    <h2>My Account</h2>
                  </Typography>
                  <div className="mb-6 flex items-center gap-3">
                    <Typography level="body2" className="font-medium md:text-base">
                      {shortenAddress(address!.toString())}
                    </Typography>
                    <button
                      type="button"
                      onClick={() => {
                        if (address) {
                          copy(address).then(() =>
                            setTimeout(() => {
                              setCopiedText('');
                            }, 1000),
                          );
                        }
                      }}
                      className="size-6"
                    >
                      {copiedText
                        ? (
                            <CheckIcon />
                          )
                        : (
                            <CopyIcon className="size-6 text-foreground-50" />
                          )}
                    </button>
                  </div>

                  <Actions />
                </div>

                {address && <ReferralCard walletAddress={address} />}
                <AccountCard />
              </div>
            )}
      </div>
    </div>
  );
};

const AccountCard = () => {
  const sm = useMediaQuery('(min-width: 640px)');

  const {
    uiAmount: bettingAmount,
    isLoading: isLoadingBetting,
    symbol: bettingSymbol,
  } = useTokenBalance(Env.NEXT_PUBLIC_BETTING_TOKEN_ADDRESS);

  const {
    uiAmount: pointAmount,
    symbol: pointSymbol,
    isLoading: isLoadingPoint,
  } = useTokenBalance(Env.NEXT_PUBLIC_POINT_TOKEN_ADDRESS);

  const {
    // uiAmount: boomAmount,
    // symbol: boomSymbol,
    isLoading: isLoadingBoom,
  } = useTokenBalance(Env.NEXT_PUBLIC_BOOM_TOKEN_ADDRESS);

  // Mobile layout
  if (!sm) {
    return <AccountCardMobile />;
  }

  if (isLoadingPoint || isLoadingBetting || isLoadingBoom) {
    return (
      <div className="w-full max-w-[520px] rounded-3xl border border-border bg-background p-8 shadow-light md:w-[30%]">
        <div className="p-6">
          <div className="mb-4 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-40" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 rounded-lg bg-blue-50 p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="space-y-2 rounded-lg bg-green-50 p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[520px] rounded-3xl border border-border bg-background p-8 shadow-light md:w-[30%]">
      <div className="mb-4 md:mb-5">
        <Typography level="body2" className="mb-2 font-medium md:text-base">
          Total balance:
        </Typography>
        <Typography className="font-bold md:text-[40px]" level="h4">
          {formatNumber(Number(bettingAmount), {
            minimumFractionDigits: 0,
          })}
          {' '}
          {bettingSymbol}
        </Typography>
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex-1 rounded-2xl bg-[#E9F4FF] p-4">
          <Typography level="body2" className="font-medium">
            Total FAST:
          </Typography>
          <Typography
            level="body1"
            className="mt-2 font-bold text-secondary md:text-2xl"
          >
            {formatNumber(Number(pointAmount), {
              minimumFractionDigits: 0,
            })}
            {pointSymbol === 'N/A' ? '' : ` ${pointSymbol}`}
          </Typography>
        </div>
        {/* <div className="flex-1 rounded-2xl bg-[#EFFFF5] p-4">
          <Typography level="body2" className="font-medium">
            Total BMT:
          </Typography>
          <Typography
            level="body1"
            className="mt-2 font-bold text-[#01A340] md:text-2xl"
          >
            {formatNumber(Number(boomAmount), {
              minimumFractionDigits: 0,
            })}
            {' '}
            {boomSymbol}
          </Typography>
        </div> */}
      </div>
    </div>
  );
};

const Actions = () => {
  const { toast } = useToast();
  const { address } = useAccount();
  const { refetch } = useTokenBalance(Env.NEXT_PUBLIC_POINT_TOKEN_ADDRESS);

  const { ready, authenticated, user, exportWallet } = usePrivy();
  const isAuthenticated = ready && authenticated;
  const [hasEmbeddedWallet, setHasEmbeddedWallet] = useState(false);

  useEffect(() => {
    if (user) {
      setHasEmbeddedWallet(
        !!user.linkedAccounts.find(
          account =>
            account.type === 'wallet'
            && account.walletClientType === 'privy'
            && account.chainType === 'ethereum',
        ),
      );
    }
  }, [user]);

  const { data, refetch: refetchClaimData } = useGetDailyReward(address);
  const claimed = !!data?.data?.daily_reward_id;

  // Get member info to check if already checked in today
  const { data: memberData, refetch: refetchMemberData }
    = useGetMember(address);
  const member = memberData?.data;

  // Check if member has checked in today
  const hasCheckedInToday = member?.lastCheckin
    ? dayjs(member.lastCheckin).isSame(dayjs(), 'day')
    : false;

  useClaimDailyRewardMutation({
    onSuccess: () => {
      toast({
        title: 'Claim successful',
        variant: 'success',
      });

      refetch();
      refetchClaimData();
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: 'Oops! Something went wrong',
        description: error?.message,
        variant: 'danger',
      });
    },
  });

  // const { signMessage } = useSignMessage({
  //   config: wagmiConfig,
  //   mutation: {
  //     onSuccess: (signature, variables) => {
  //       claimReward({
  //         walletAddress: variables.account as string,
  //         message: variables.message.toString(),
  //         signature: signature as string,
  //         claimed_at: new Date().toISOString(),
  //       });
  //     },
  //     onError: (error) => {
  //       console.error(error);
  //       toast({
  //         title: 'Oops! Something went wrong',
  //         description: error?.message,
  //         variant: 'danger',
  //       });
  //     },
  //   },
  // });

  const handleDailyCheckin = async () => {
    if (!address) {
      toast({
        title: 'Please connect your wallet first',
        variant: 'danger',
      });
      return;
    }

    try {
      const response = await api.memberCheckin(address);

      if (response.success) {
        toast({
          title: 'Daily check-in successful',
          variant: 'success',
        });

        refetch();
        refetchClaimData();
        refetchMemberData();

        // Reload the page after successful check-in
        // window.location.reload();
      } else {
        throw new Error(response.error || 'Check-in failed');
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Oops! Something went wrong',
        description: error?.message,
        variant: 'danger',
      });
    }
  };

  // const handleClaimReward = () => {
  //   if (!address) {
  //     toast({
  //       title: 'Please connect your wallet first',
  //       variant: 'danger',
  //     });
  //   }

  //   const message = `${Date.now()}`;

  //   signMessage({
  //     account: address,
  //     message,
  //   });
  // };

  return (
    <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
      <Button
        disabled={claimed || hasCheckedInToday}
        onClick={handleDailyCheckin}
        noShadow
        className={cn({
          'bg-[#D8D8D8] text-[#777777] border-none':
            claimed || hasCheckedInToday,
        })}
      >
        Check in Daily
      </Button>
      {/* <ExchangeDialog>
        <Button variant="outline" noShadow>
          Exchange
        </Button>
      </ExchangeDialog> */}
      {isAuthenticated && hasEmbeddedWallet && (
        <Button variant="outline" noShadow onClick={exportWallet}>
          Export wallet
        </Button>
      )}
    </div>
  );
};
