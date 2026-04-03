'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { waitForTransactionReceipt } from '@wagmi/core';
import { useState } from 'react';
import type { Address } from 'viem';
import { formatUnits } from 'viem';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';

import {
  FAST_TOKEN_ADDRESS,
  OPINION_BOUNTY_CATEGORY,
} from '@/config/constants';
import {
  fastTokenABI,
  kaiaMarketContractABI,
  marketContractABI,
} from '@/config/contract';
import { appQueryKeys } from '@/config/query';
import { wagmiConfig } from '@/config/wagmi';
import { useTokenBalance } from '@/hooks/use-contract';
import {
  useGetMemberBettings,
  useGetMemberReferrals,
} from '@/hooks/use-member';
import { useClaimBountyRewardMutation } from '@/hooks/use-quest';
import { useToast } from '@/hooks/use-toast';
import api from '@/libs/api';
import type { Referral } from '@/types/schema';
import { formatNumber } from '@/utils/number';
import {
  calculatePotentialReward,
  getBettingToken,
  getMarketContract,
} from '@/utils/quest';

const MobilePositionRow = ({ betting }: { betting: any }) => {
  const { toast } = useToast();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract({
    config: wagmiConfig,
  });
  const queryClient = useQueryClient();

  const marketContract = getMarketContract(betting.quest);
  const bettingToken = getBettingToken(betting.quest);
  const { refetch: reloadBalance } = useTokenBalance(bettingToken.address);
  const isBounty
    = betting.quest?.quest_category?.quest_category_title
      === OPINION_BOUNTY_CATEGORY;
  const isCancel
    = betting.quest?.quest_status === 'ADJOURN'
      || betting.quest?.quest_status === 'REJECT';
  const isWin = betting.answer?.answer_selected;
  const isEmptyBounty = isBounty && betting.reward_amount === 0;

  let variant: 'unclaimable' | 'claimable' | 'claimed' | 'adjourn'
    = 'unclaimable';

  if (isCancel) {
    variant = 'adjourn';
  } else if (betting.quest?.quest_status === 'MARKET_SUCCESS') {
    variant = betting.reward_claimed
      ? 'claimed'
      : isWin
        ? 'claimable'
        : 'unclaimable';
  }

  if (isEmptyBounty) {
    variant = 'unclaimable';
  }

  const { mutate: claimBountyReward } = useClaimBountyRewardMutation({
    onSuccess: () => {
      toast({
        title: 'Reward claimed successfully',
        variant: 'success',
      });
      window.location.reload();
    },
  });

  const { mutate: claimReward, isPending: isClaiming } = useMutation({
    mutationKey: [...appQueryKeys.member.claimVotingReward, betting.quest_key],
    mutationFn: async () => {
      const args = [betting.quest_key, betting.betting_key];

      // Select correct ABI based on token type
      const contractABI = bettingToken.isNative
        ? kaiaMarketContractABI
        : marketContractABI;

      const params = {
        address: marketContract as Address,
        abi: contractABI,
        functionName: 'receiveToken',
        account: address,
        args,
      };

      const hash = await writeContractAsync({
        ...params,
      });

      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });

      if (receipt.status !== 'success') {
        throw new Error('An unexpected error has occurred');
      }

      await api.claimBettingReward({
        betting_key: betting.betting_key!,
        reward_tx: receipt.transactionHash,
      });

      return hash;
    },
    onSuccess: () => {
      toast({
        title: 'Reward claimed successfully',
        variant: 'success',
      });

      queryClient.invalidateQueries({
        queryKey: [...appQueryKeys.member.bettings, address as string].filter(
          Boolean,
        ),
      });

      reloadBalance();
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

  const handleClaimReward = async () => {
    if (isCancel || betting.reward_claimed) {
      return;
    }

    if (!address) {
      toast({
        title: 'Please connect your wallet first',
        variant: 'danger',
      });
      return;
    }

    if (isBounty) {
      claimBountyReward({
        betting_address: betting.betting_address,
        answer_key: betting.answer.answer_key,
        address: address as string,
      });
    } else {
      claimReward();
    }
  };

  return (
    <div className="grid grid-cols-6 items-center gap-2">
      <div className="flex justify-start">
        <button
          type="button"
          disabled={
            isCancel
            || isClaiming
            || isEmptyBounty
            || variant === 'unclaimable'
            || variant === 'claimed'
          }
          onClick={handleClaimReward}
          className={`flex h-5 w-9 items-center justify-center rounded-md font-baloo-2 text-xs font-normal disabled:opacity-40 ${
            variant === 'claimable'
              ? 'bg-[rgba(59,39,223,0.2)] text-[#3B27DF]'
              : variant === 'claimed'
                ? 'bg-[rgba(255,165,0,0.2)] text-orange-600'
                : variant === 'adjourn'
                  ? 'bg-[rgba(0,0,0,0.2)] text-black'
                  : 'bg-[rgba(216,216,216,0.2)] text-gray-500'
          }`}
        >
          {isClaiming ? '...' : variant === 'claimed' ? '✓' : 'Claim'}
        </button>
      </div>
      <span className="truncate font-baloo-2 text-[12px] leading-[1.6] text-black">
        {betting.reward_amount
        || formatNumber(calculatePotentialReward(betting), {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        })}
        {' '}
        {isBounty ? 'FP' : getBettingToken(betting.quest).symbol}
      </span>
      <span className="truncate font-baloo-2 text-[12px] leading-[1.6] text-black">
        {betting.quest?.quest_title
          ? `${betting.quest.quest_title.slice(0, 15)}...`
          : 'N/A'}
      </span>
      <span className="truncate pl-4 font-baloo-2 text-[12px] leading-[1.6] text-black">
        {(() => {
          const status = betting.quest?.quest_status || 'Open';
          return status.startsWith('MARKET_')
            ? status.replace('MARKET_', '')
            : status;
        })()}
      </span>
      <span className="w-[80px] truncate pl-4 font-baloo-2 text-[12px] leading-[1.6] text-black">
        {betting.answer?.answer_title || 'N/A'}
      </span>
      <span className="truncate text-right font-baloo-2 text-[12px] leading-[1.6] text-black">
        {formatNumber(
          isBounty
            ? (betting.quest?.extra_data?.points ?? 0)
            : (betting.total_betting_amount ?? 0),
          {
            minimumFractionDigits: 0,
            maximumFractionDigits: 4,
          },
        )}
        {' '}
        {isBounty ? 'FP' : getBettingToken(betting.quest).symbol}
      </span>
    </div>
  );
};

const ITEMS_PER_PAGE = 10;

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-3 flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label="Previous page"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        className="rounded-md bg-[#3B27DF] px-2 py-1 text-white disabled:opacity-40"
        disabled={currentPage <= 1}
      >
        ‹
      </button>
      <span className="font-baloo-2 text-xs text-black">
        {currentPage}
        {' '}
        /
        {totalPages}
      </span>
      <button
        type="button"
        aria-label="Next page"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        className="rounded-md bg-[#3B27DF] px-2 py-1 text-white disabled:opacity-40"
        disabled={currentPage >= totalPages}
      >
        ›
      </button>
    </div>
  );
};

export const MobileActivitiesSection = () => {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<
    'reward' | 'activity' | 'referrals' | 'lockTokens'
  >('reward');

  // Pagination states for each tab
  const [rewardPage, setRewardPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);
  const [referralsPage, setReferralsPage] = useState(1);
  const [lockTokensPage, setLockTokensPage] = useState(1);

  const { data: bettingData, isLoading } = useGetMemberBettings(address || '');
  const { data: referralsData, isLoading: isLoadingReferrals }
    = useGetMemberReferrals(address || '');

  // Fetch locked tokens data
  const {
    data: locks,
    isLoading: isLoadingLocks,
    isError: isErrorLocks,
  } = useReadContract({
    address: FAST_TOKEN_ADDRESS,
    abi: fastTokenABI,
    functionName: 'getLocks',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  const locksList
    = (locks as Array<{ amount: bigint; unlockTime: bigint }>) || [];
  const positionActivities = bettingData?.data || [];
  const activityTransactions = bettingData?.data || [];
  const referrals: Referral[] = (referralsData?.data ?? []) as Referral[];

  const displayPositionActivities = positionActivities;
  const displayActivities = activityTransactions;

  if (isLoading) {
    return (
      <div className="mt-4 space-y-4">
        <div className="flex items-center gap-[17px]">
          <button
            type="button"
            onClick={() => setActiveTab('reward')}
            className={`font-baloo-2 text-[14px] font-semibold leading-[1.4] ${
              activeTab === 'reward' ? 'text-[#3B27DF]' : 'text-black/50'
            }`}
          >
            Reward
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`font-baloo-2 text-[14px] font-semibold leading-[1.4] ${
              activeTab === 'activity' ? 'text-[#3B27DF]' : 'text-black/50'
            }`}
          >
            Activity
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('referrals')}
            className={`font-baloo-2 text-[14px] font-semibold leading-[1.4] ${
              activeTab === 'referrals' ? 'text-[#3B27DF]' : 'text-black/50'
            }`}
          >
            Referrals
          </button>
        </div>
        <div className="py-4 text-center">
          <span className="font-baloo-2 text-[12px] text-black/50">
            Loading activities...
          </span>
        </div>
      </div>
    );
  }

  const renderPositionTable = () => {
    const winningActivities = displayPositionActivities.filter(
      (betting: any) => {
        const isBounty
          = betting.quest?.quest_category?.quest_category_title
            === OPINION_BOUNTY_CATEGORY;
        const isCancel
          = betting.quest?.quest_status === 'ADJOURN'
            || betting.quest?.quest_status === 'REJECT';
        const isWin = betting.answer?.answer_selected;
        const isMarketSuccess
          = betting.quest?.quest_status === 'MARKET_SUCCESS';
        const isEmptyBounty = isBounty && betting.reward_amount === 0;

        return isCancel || (isMarketSuccess && isWin && !isEmptyBounty);
      },
    );

    const totalPages = Math.ceil(winningActivities.length / ITEMS_PER_PAGE);
    const paginatedData = winningActivities.slice(
      (rewardPage - 1) * ITEMS_PER_PAGE,
      rewardPage * ITEMS_PER_PAGE,
    );

    return (
      <div className="overflow-x-auto overflow-y-hidden">
        <div className="min-w-[390px]">
          <div className="grid grid-cols-6 items-center gap-2">
            <span className="text-start font-baloo-2 text-[12px] leading-[1.4] text-black/50">
              Action
            </span>
            <span className="font-baloo-2 text-[12px] leading-[1.4] text-black/50">
              Reward
            </span>
            <span className="font-baloo-2 text-[12px] leading-[1.4] text-black/50">
              Title
            </span>
            <span className="pl-4 font-baloo-2 text-[12px] leading-[1.4] text-black/50 ">
              Status
            </span>
            <span className="w-[80px] pl-4 font-baloo-2 text-[12px] leading-[1.4] text-black/50">
              My Answer
            </span>
            <span className="text-right font-baloo-2 text-[12px] leading-[1.4] text-black/50">
              Amount
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {paginatedData.length > 0
              ? (
                  paginatedData.map((betting: any, index: number) => (
                    <MobilePositionRow
                      key={betting.betting_key || index}
                      betting={betting}
                    />
                  ))
                )
              : (
                  <div className="py-4 text-center">
                    <span className="font-baloo-2 text-[12px] text-black/50">
                      No activities found
                    </span>
                  </div>
                )}
          </div>

          <Pagination
            currentPage={rewardPage}
            totalPages={totalPages}
            onPageChange={setRewardPage}
          />
        </div>
      </div>
    );
  };

  const renderActivityTable = () => {
    const totalPages = Math.ceil(displayActivities.length / ITEMS_PER_PAGE);
    const paginatedData = displayActivities.slice(
      (activityPage - 1) * ITEMS_PER_PAGE,
      activityPage * ITEMS_PER_PAGE,
    );

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[324px]">
          <div className="grid grid-cols-4 items-center gap-4">
            <span className="font-baloo-2 text-[12px] font-medium leading-[1.6] text-black/50">
              Title
            </span>
            <span className="font-baloo-2 text-[12px] font-medium leading-[1.6] text-black/50">
              Status
            </span>
            <span className="font-baloo-2 text-[12px] font-medium leading-[1.6] text-black/50">
              Amount
            </span>
            <span className="font-baloo-2 text-[12px] font-medium leading-[1.6] text-black/50">
              Date
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {paginatedData.length > 0
              ? (
                  paginatedData.map((activity: any) => (
                    <div
                      key={`${activity.betting_key || activity.quest?.quest_key || Math.random()}`}
                      className="grid grid-cols-4 items-center gap-4"
                    >
                      <span className="truncate font-baloo-2 text-[12px] leading-[1.6] text-black">
                        {activity.quest?.quest_title
                          ? `${activity.quest.quest_title.slice(0, 15)}...`
                          : 'N/A'}
                      </span>
                      <span className="truncate font-baloo-2 text-[12px] leading-[1.6] text-black">
                        {(() => {
                          const status = activity.quest?.quest_status || 'Open';
                          return status.startsWith('MARKET_')
                            ? status.replace('MARKET_', '')
                            : status;
                        })()}
                      </span>
                      <span className="truncate font-baloo-2 text-[12px] leading-[1.6] text-black">
                        {activity.betting_amount || '0'}
                        {' '}
                        {getBettingToken(activity.quest).symbol}
                      </span>
                      <span className="whitespace-nowrap font-baloo-2 text-[12px] leading-[1.6] text-black">
                        {activity.betting_created_at
                          ? new Date(
                              activity.betting_created_at,
                            ).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                            })
                          : 'N/A'}
                      </span>
                    </div>
                  ))
                )
              : (
                  <div className="py-4 text-center">
                    <span className="font-baloo-2 text-[12px] text-black/50">
                      No activity data available
                    </span>
                  </div>
                )}
          </div>

          <Pagination
            currentPage={activityPage}
            totalPages={totalPages}
            onPageChange={setActivityPage}
          />
        </div>
      </div>
    );
  };

  const renderReferralsTable = () => {
    if (isLoadingReferrals) {
      return (
        <div className="py-4 text-center">
          <span className="font-baloo-2 text-[12px] text-black/50">
            Loading referrals...
          </span>
        </div>
      );
    }

    const totalPages = Math.ceil(referrals.length / ITEMS_PER_PAGE);
    const paginatedData = referrals.slice(
      (referralsPage - 1) * ITEMS_PER_PAGE,
      referralsPage * ITEMS_PER_PAGE,
    );

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[334px]">
          <div className="grid grid-cols-2 items-center gap-8">
            <span className="font-baloo-2 text-[12px] font-medium leading-[1.4] text-black/50">
              User
            </span>
            <span className="text-right font-baloo-2 text-[12px] font-medium leading-[1.4] text-black/50">
              Points
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {paginatedData.length > 0
              ? (
                  paginatedData.map((referral: Referral) => (
                    <div
                      key={referral.invitee?.wallet_address}
                      className="grid grid-cols-2 items-center gap-8"
                    >
                      <span className="truncate font-baloo-2 text-[12px] leading-[1.6] text-black">
                        {referral.invitee.wallet_address}
                      </span>
                      <span className="text-right font-baloo-2 text-[12px] leading-[1.6] text-black">
                        {referral.total_points}
                      </span>
                    </div>
                  ))
                )
              : (
                  <div className="py-4 text-center">
                    <span className="font-baloo-2 text-[12px] text-black/50">
                      No referrals found
                    </span>
                  </div>
                )}
          </div>

          <Pagination
            currentPage={referralsPage}
            totalPages={totalPages}
            onPageChange={setReferralsPage}
          />
        </div>
      </div>
    );
  };

  const renderLockTokensTable = () => {
    const formatDate = (timestamp: bigint) => {
      return new Date(Number(timestamp) * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    };

    if (isLoadingLocks) {
      return (
        <div className="py-4 text-center">
          <span className="font-baloo-2 text-[12px] text-black/50">
            Loading locked tokens...
          </span>
        </div>
      );
    }

    const totalPages = Math.ceil(locksList.length / ITEMS_PER_PAGE);
    const paginatedData = locksList.slice(
      (lockTokensPage - 1) * ITEMS_PER_PAGE,
      lockTokensPage * ITEMS_PER_PAGE,
    );

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[300px]">
          <div className="grid grid-cols-2 items-center gap-4">
            <span className="font-baloo-2 text-[12px] font-medium leading-[1.4] text-black/50">
              Amount
            </span>
            <span className="text-right font-baloo-2 text-[12px] font-medium leading-[1.4] text-black/50">
              Unlock At
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {paginatedData.length > 0 && !isErrorLocks
              ? (
                  paginatedData.map(lock => (
                    <div
                      key={`lock-${lock.unlockTime.toString()}-${lock.amount.toString()}`}
                      className="grid grid-cols-2 items-center gap-4"
                    >
                      <span className="truncate font-baloo-2 text-[12px] leading-[1.6] text-black">
                        {formatUnits(lock.amount, 18)}
                        {' '}
                        FAST
                      </span>
                      <span className="text-right font-baloo-2 text-[12px] leading-[1.6] text-black">
                        {formatDate(lock.unlockTime)}
                      </span>
                    </div>
                  ))
                )
              : (
                  <div className="py-4 text-center">
                    <span className="font-baloo-2 text-[12px] text-black/50">
                      {address
                        ? 'No locked tokens found'
                        : 'Connect wallet to view locked tokens'}
                    </span>
                  </div>
                )}
          </div>

          <Pagination
            currentPage={lockTokensPage}
            totalPages={totalPages}
            onPageChange={setLockTokensPage}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-[17px]">
        <button
          type="button"
          onClick={() => setActiveTab('activity')}
          className={`font-baloo-2 text-[14px] font-semibold leading-[1.4] ${
            activeTab === 'activity' ? 'text-[#3B27DF]' : 'text-black/50'
          }`}
        >
          Activity
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reward')}
          className={`font-baloo-2 text-[14px] font-semibold leading-[1.4] ${
            activeTab === 'reward' ? 'text-[#3B27DF]' : 'text-black/50'
          }`}
        >
          Reward
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('referrals')}
          className={`font-baloo-2 text-[14px] font-semibold leading-[1.4] ${
            activeTab === 'referrals' ? 'text-[#3B27DF]' : 'text-black/50'
          }`}
        >
          Referrals
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('lockTokens')}
          className={`font-baloo-2 text-[14px] font-semibold leading-[1.4] ${
            activeTab === 'lockTokens' ? 'text-[#3B27DF]' : 'text-black/50'
          }`}
        >
          Lock Tokens
        </button>
      </div>

      {activeTab === 'reward' && renderPositionTable()}
      {activeTab === 'activity' && renderActivityTable()}
      {activeTab === 'referrals' && renderReferralsTable()}
      {activeTab === 'lockTokens' && renderLockTokensTable()}
    </div>
  );
};
