'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CellContext, ColumnDef } from '@tanstack/react-table';
import { waitForTransactionReceipt } from '@wagmi/core';
import { useMemo } from 'react';
import type { Address } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';

import { DataTable } from '@/components/ui/data-table';
import { OPINION_BOUNTY_CATEGORY } from '@/config/constants';
import { marketContractABI } from '@/config/contract';
import { appQueryKeys } from '@/config/query';
import { wagmiConfig } from '@/config/wagmi';
import { useTokenBalance } from '@/hooks/use-contract';
import { useDataTable } from '@/hooks/use-data-table';
import { useGetMemberBettings } from '@/hooks/use-member';
import { useClaimBountyRewardMutation } from '@/hooks/use-quest';
import { useToast } from '@/hooks/use-toast';
import api from '@/libs/api';
import type { MemberBetting, QuestStatus } from '@/types/schema';
import { formatNumber } from '@/utils/number';
import { calculatePotentialReward, getBettingToken, getMarketContract } from '@/utils/quest';

import { CustomCheckbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';
import type { ClaimButtonProps } from './claim-button';
import { ClaimButton } from './claim-button';

const questStatuses = [
  { name: 'Draft', value: 'draft' },
  { name: 'Success', value: 'success' },
  { name: 'Answer', value: 'answer' },
  { name: 'Done', value: 'done' },
];

function getColumns(): ColumnDef<MemberBetting>[] {
  return [
    {
      id: 'select',
      header: 'Reward',
      cell: RewardButton,
      enableSorting: false,
      enableHiding: false,
      size: 64,
      meta: {
        style: {
          textAlign: 'center',
        },
      },
    },
    {
      header: 'Category',
      size: 180,
      cell: ({ row }) =>
        row.original.quest
          ? row.original.quest.quest_category.quest_category_title
          : 'N/A',
    },
    {
      accessorKey: 'quest.quest_title',
      header: 'Title',
      size: 240,
      cell: ({ row }) =>
        row.original.quest ? row.original.quest.quest_title : 'N/A',
    },
    {
      accessorKey: 'statusFlow',
      header: 'Status Flow',
      size: 280,
      cell: StatusFlow,
      meta: {
        style: {
          textAlign: 'center',
        },
      },
    },
    {
      accessorKey: 'answer_key',
      header: 'My Answer',
      cell: ({ row }) => (
        <p className="text-center">
          {row.original.quest ? row.original.answer.answer_title : 'N/A'}
        </p>
      ),
      meta: {
        style: {
          textAlign: 'center',
        },
      },
    },
    {
      accessorKey: 'betting_amount',
      header: 'My Vote',
      meta: {
        style: {
          textAlign: 'center',
        },
      },
      cell: ({ row }) =>
        row.original.quest.quest_category.quest_category_title
        === OPINION_BOUNTY_CATEGORY
          ? (
              <p className="text-center">
                {row.original.quest ? row.original.answer.answer_title : 'N/A'}
              </p>
            )
          : (
              <p className="text-center">
                {row.original.betting_amount}
                {' '}
                {getBettingToken(row.original.quest).symbol}
              </p>
            ),
    },
    {
      header: 'Potential Reward',
      cell: ({ row }) => {
        const symbol
          = row.original.quest.quest_category.quest_category_title
          === OPINION_BOUNTY_CATEGORY
            ? 'Points'
            : getBettingToken(row.original.quest).symbol;
        return (
          <p className="text-center">
            {formatNumber(calculatePotentialReward(row.original), {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
            {' '}
            {symbol}
          </p>
        );
      },
      meta: {
        style: {
          textAlign: 'center',
        },
      },
    },
  ];
}

const StatusFlow = ({ row }: CellContext<MemberBetting, unknown>) => {
  if (
    row.original.quest.quest_category.quest_category_title
    === OPINION_BOUNTY_CATEGORY
  ) {
    return null;
  }

  const isChecked = (val: string): boolean => {
    const questStatus = row.original.quest.quest_status as QuestStatus;

    switch (val) {
      case 'draft':
        return ['PUBLISH', 'FINISH', 'DAO_SUCCESS', 'MARKET_SUCCESS'].includes(
          questStatus,
        );

      case 'success':
        return ['FINISH', 'DAO_SUCCESS', 'MARKET_SUCCESS'].includes(
          questStatus,
        );

      case 'answer':
        return ['DAO_SUCCESS', 'MARKET_SUCCESS'].includes(questStatus);

      case 'done':
        return questStatus === 'MARKET_SUCCESS';

      default:
        return false;
    }
  };

  return (
    <div className="relative flex items-center gap-6">
      {questStatuses.map(status => (
        <div
          key={status.value}
          className="flex w-full flex-col items-center gap-1"
        >
          <CustomCheckbox
            defaultChecked={isChecked(status.value)}
            id={status.value}
            className="pointer-events-none"
          />
          <Label htmlFor={status.value}>{status.name}</Label>
        </div>
      ))}

      {row.original?.quest?.quest_status === 'ADJOURN' && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl border border-border bg-black/60 font-medium text-white backdrop-blur">
          Adjourn
        </div>
      )}
    </div>
  );
};

const RewardButton = ({ row }: CellContext<MemberBetting, unknown>) => {
  const original = row.original;
  const quest = row.original.quest;
  const marketContract = getMarketContract(quest);
  const bettingToken = getBettingToken(quest);

  const isCancel
    = quest?.quest_status === 'ADJOURN' || quest?.quest_status === 'REJECT';

  const isEmptyBounty
    = quest.quest_category.quest_category_title === OPINION_BOUNTY_CATEGORY
    && original.reward_amount === 0;

  const isWin = original.answer.answer_selected;

  let variant: ClaimButtonProps['variant'] = 'unclaimable';

  if (isCancel) {
    variant = 'adjourn';
  } else if (quest?.quest_status === 'MARKET_SUCCESS') {
    variant = original.reward_claimed
      ? 'claimed'
      : isWin
        ? 'claimable'
        : 'unclaimable';
  }

  if (isEmptyBounty) {
    variant = 'unclaimable';
  }

  const { toast } = useToast();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract({
    config: wagmiConfig,
  });
  const { refetch: reloadBalance } = useTokenBalance(bettingToken.address);
  const queryClient = useQueryClient();

  const { mutate: claimReward, isPending: isClaiming } = useMutation({
    mutationKey: [
      ...appQueryKeys.member.claimVotingReward,
      row.original.quest_key,
    ],
    mutationFn: async () => {
      const args = [original.quest_key, original.betting_key];

      const params = {
        address: marketContract as Address,
        abi: marketContractABI,
        functionName: 'receiveToken',
        account: address,
        args,
      };

      // const gas = await publicClient.estimateContractGas(params);
      // const gasPrice = await getGasPrice();

      const hash = await writeContractAsync({
        ...params,
        // gasPrice,
        // gas,
      });

      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });

      if (receipt.status !== 'success') {
        throw new Error('An unexpected error has occurred');
      }

      await api.claimBettingReward({
        betting_key: original.betting_key!,
        reward_tx: receipt.transactionHash,
      });

      return true;
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

  const { mutate: claimBountyReward } = useClaimBountyRewardMutation({
    onSuccess: () => {
      toast({
        title: 'Reward claimed successfully',
        variant: 'success',
      });

      window.location.reload();
    },
  });

  const handleClaimReward = () => {
    if (isCancel || original.reward_claimed) {
      return;
    }

    if (!address) {
      toast({
        title: 'Please connect your wallet first',
        variant: 'danger',
      });
    }

    if (
      row.original.quest.quest_category.quest_category_title
      === OPINION_BOUNTY_CATEGORY
    ) {
      claimBountyReward({
        betting_address: row.original.betting_address,
        answer_key: row.original.answer.answer_key,
        address,
      });
      return;
    }

    claimReward();
  };

  return (
    <ClaimButton
      variant={variant}
      disabled={isCancel || isClaiming || isEmptyBounty}
      loading={isClaiming}
      onClick={handleClaimReward}
    />
  );
};

export const GamesTable = () => {
  const { address } = useAccount();
  const { data, isLoading } = useGetMemberBettings(address!);

  const columns = useMemo(() => {
    const cols = getColumns();

    return isLoading
      ? cols.map(column => ({
        ...column,
        cell: () => <Skeleton className="h-4 w-16" />,
      }))
      : cols;
  }, [isLoading]);

  const quests = useMemo(
    () =>
      (isLoading
        ? Array.from({ length: 10 }).map((_, idx) => ({
          betting_key: Date.now() + idx,
        }))
        : (data?.data ?? [])) as MemberBetting[],
    [isLoading, data],
  );

  const { table } = useDataTable({
    data: quests,
    columns,
    pageCount: -1,
    initialState: {
      sorting: [{ id: 'betting_created_at', desc: true }],
    },
    getRowId: (originalRow: MemberBetting) => `${originalRow.betting_key}`,
  });

  return <DataTable table={table} />;
};
