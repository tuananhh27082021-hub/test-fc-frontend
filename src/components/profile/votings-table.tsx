'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CellContext, ColumnDef } from '@tanstack/react-table';
import { waitForTransactionReceipt } from '@wagmi/core';
import { useMemo } from 'react';
import { type Address, formatEther, parseEventLogs } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';

import { DataTable } from '@/components/ui/data-table';
import { governanceContractABI } from '@/config/contract';
import { appQueryKeys } from '@/config/query';
import { wagmiConfig } from '@/config/wagmi';
import { useGetGovernanceConfig } from '@/hooks/use-contract';
import { useDataTable } from '@/hooks/use-data-table';
import { useGetMemberVotings } from '@/hooks/use-member';
import { useToast } from '@/hooks/use-toast';
import api from '@/libs/api';
import { Env } from '@/libs/Env';
import type { MemberVoting, QuestStatus } from '@/types/schema';
import { formatNumber } from '@/utils/number';

import { Skeleton } from '../ui/skeleton';
import { Typography } from '../ui/typography';
import type { ClaimButtonProps } from './claim-button';
import { ClaimButton } from './claim-button';
import { StatusFlow } from './status-flow';

function getColumns({
  vottingToken,
  reward,
}: {
  vottingToken: string;
  reward: number;
}): ColumnDef<MemberVoting>[] {
  return [
    {
      id: 'select',
      header: 'Reward',
      cell: ClaimRewardCell,
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
      accessorKey: 'quest_category',
      header: 'Category',
      size: 180,
    },
    {
      accessorKey: 'quest_title',
      header: 'Title',
    },
    {
      accessorKey: 'statusFlow',
      header: 'Status Flow',
      cell: StatusFlowCell,
      meta: {
        style: {
          textAlign: 'center',
        },
      },
    },
    {
      accessorKey: 'quest_answer_title',
      header: 'My Answer',
      cell: ({ row }) => (
        <Typography className="text-center font-medium">
          {row.original.quest_answer_title}
        </Typography>
      ),
      meta: {
        style: {
          textAlign: 'center',
        },
      },
    },
    {
      header: 'Total Reward',
      cell: ({ row }) => (
        <Typography className="text-center font-medium">
          {formatNumber(reward * row.original.vote_power, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          })}
          {' '}
          {vottingToken}
        </Typography>
      ),
      meta: {
        style: {
          textAlign: 'center',
        },
      },
    },
  ];
}

export const VotingTable = () => {
  const { address } = useAccount();
  const { data, isLoading } = useGetMemberVotings(address!);
  // const { symbol } = useGetTokenInfo(Env.NEXT_PUBLIC_BOOM_TOKEN_ADDRESS);
  const symbol = 'FAST';
  const { reward } = useGetGovernanceConfig();

  const columns = useMemo(() => {
    const cols = getColumns({ vottingToken: symbol, reward });

    return isLoading
      ? cols.map(column => ({
        ...column,
        cell: () => <Skeleton className="h-4 w-16" />,
      }))
      : cols;
  }, [isLoading, getColumns, symbol, reward]);

  const quests = useMemo(
    () =>
      (isLoading
        ? Array.from({ length: 10 }).map((_, idx) => ({
          betting_key: Date.now() + idx,
        }))
        : (data?.data?.votes ?? [])) as MemberVoting[],
    [isLoading, data],
  );

  const { table } = useDataTable({
    data: quests,
    columns,
    pageCount: -1,
    initialState: {},
    getRowId: (originalRow: MemberVoting) => originalRow.quest_key,
  });

  return <DataTable table={table} />;
};

const ClaimRewardCell = ({ row }: CellContext<MemberVoting, unknown>) => {
  const quest = row.original;

  const isCancel
    = quest?.quest_status === 'ADJOURN' || quest?.quest_status === 'REJECT';

  let variant: ClaimButtonProps['variant'] = 'unclaimable';

  if (isCancel) {
    variant = 'adjourn';
  } else if (quest?.quest_status === 'MARKET_SUCCESS') {
    variant = quest.vote_reward
      ? 'claimed'
      : String(quest.selected?.answer_key) === String(quest.quest_answer_key)
        ? 'claimable'
        : 'unclaimable';
  }

  const { toast } = useToast();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract({
    config: wagmiConfig,
  });
  const queryClient = useQueryClient();

  const { mutate: claimReward, isPending: isClaiming } = useMutation({
    mutationKey: [
      ...appQueryKeys.member.claimVotingReward,
      row.original.quest_key,
    ],
    mutationFn: async () => {
      const args = [row.original.quest_key];

      const params = {
        address: Env.NEXT_PUBLIC_GOVERNANCE_ADDRESS as Address,
        abi: governanceContractABI,
        functionName: 'distributeDaoReward',
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

      const logs = parseEventLogs({
        abi: governanceContractABI,
        eventName: 'GetReward',
        logs: receipt.logs,
      });

      if (!logs || logs.length <= 0) {
        throw new Error('An unexpected error has occurred');
      }

      const log = logs[0] as any;
      const reward = formatEther(log.args.reward);

      await api.claimVoteReward({
        quest_key: quest.quest_key!,
        voter: address as string,
        reward,
      });

      return hash;
    },
    onSuccess: () => {
      toast({
        title: 'Reward claimed successfully',
        variant: 'success',
      });

      queryClient.invalidateQueries({
        queryKey: [...appQueryKeys.member.votings, address as string].filter(
          Boolean,
        ),
      });
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
    if (isCancel) {
      return;
    }

    if (!address) {
      toast({
        title: 'Please connect your wallet first',
      });
    }

    claimReward();
  };

  return (
    <ClaimButton
      variant={variant}
      disabled={isCancel || isClaiming}
      loading={isClaiming}
      onClick={handleClaimReward}
    />
  );
};

const questStatuses = [
  { name: 'Draft', value: 'draft' },
  { name: 'Success', value: 'success' },
  { name: 'Answer', value: 'answer' },
  { name: 'Done', value: 'done' },
];

const StatusFlowCell = ({ row }: CellContext<MemberVoting, unknown>) => {
  const quest = row.original;

  const isAdjourn
    = quest?.quest_status === 'ADJOURN' || quest?.quest_status === 'REJECT';

  const isChecked = (val: string): boolean => {
    const questStatus = quest.quest_status.toUpperCase() as QuestStatus;

    switch (val) {
      case 'draft':
        return [
          'APPROVE',
          'REJECT',
          'DAO_SUCCESS',
          'MARKET_SUCCESS',
          'FINISH',
        ].includes(questStatus);

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
    <StatusFlow
      options={questStatuses}
      isAdjourn={isAdjourn}
      isChecked={isChecked}
    />
  );
};
