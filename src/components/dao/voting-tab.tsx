'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { readContract, waitForTransactionReceipt } from '@wagmi/core';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { type Address, parseEventLogs } from 'viem';
import { useAccount, useWriteContract } from 'wagmi';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Typography } from '@/components/ui/typography';
import { governanceContractABI, nftContractABI } from '@/config/contract';
import { appQueryKeys } from '@/config/query';
import { wagmiConfig } from '@/config/wagmi';
import { useGetGovernanceConfig } from '@/hooks/use-contract';
import { useToast } from '@/hooks/use-toast';
import api from '@/libs/api';
import { Env } from '@/libs/Env';
import type {
  DAOQuestAnswer,
  DAOQuestDraft,
  DAOQuestSuccess,
  VoteDraftOption,
  VoteSuccessOption,
} from '@/types/schema';
import { formatNumber } from '@/utils/number';
import { extractDAOQuest } from '@/utils/quest';

type VotingTabProps =
  | { status: 'draft'; quest: DAOQuestDraft }
  | { status: 'success'; quest: DAOQuestSuccess }
  | { status: 'answer'; quest: DAOQuestAnswer };

export const VotingTab = ({ quest, status }: VotingTabProps) => {
  const { maxVote } = useGetGovernanceConfig();

  const { posVote, negVote, totalVote, endAt } = extractDAOQuest(
    quest,
    status,
    maxVote,
  );

  let view = null;

  const posVotePer = Number.isNaN(posVote / totalVote)
    ? 0
    : posVote / totalVote;

  const negVotePer = Number.isNaN(negVote / totalVote)
    ? 0
    : negVote / totalVote;

  if (status === 'answer') {
    view = <AnswerActions quest={quest} />;
  } else {
    view = (
      <div className="flex items-center gap-10">
        <div className="flex-1">
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between">
              <Typography
                level="body2"
                className="font-medium text-foreground-70"
              >
                1. Approve
              </Typography>
              <div className="flex items-center gap-1">
                <Typography
                  level="body2"
                  className="font-medium text-foreground-70"
                >
                  {posVote}
                </Typography>
                <Badge>
                  {formatNumber(posVotePer * 100, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                  %
                </Badge>
              </div>
            </div>
            <Progress value={posVotePer * 100} variant="success" />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between">
              <Typography
                level="body2"
                className="font-medium text-foreground-70"
              >
                2. Reject
              </Typography>
              <div className="flex items-center gap-1">
                <Typography
                  level="body2"
                  className="font-medium text-foreground-70"
                >
                  {negVote}
                </Typography>
                <Badge>
                  {formatNumber(negVotePer * 100, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                  %
                </Badge>
              </div>
            </div>
            <Progress value={negVotePer * 100} variant="danger" />
          </div>
        </div>
        {status === 'draft' && <DraftActions quest={quest} maxVote={maxVote} />}

        {status === 'success' && <SuccessActions quest={quest} />}
      </div>
    );
  }

  return (
    <>
      <TimeLeft endAt={endAt} />
      {view}
    </>
  );
};

const TimeLeft = ({ endAt }: { endAt: string }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  const calculateTimeLeft = (endAt: string) => {
    const now = new Date();
    const diff = new Date(endAt).getTime() - now.getTime();
    return formatTimeLeft(diff);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endAt));
    }, 1000);

    return () => clearInterval(timer);
  }, [endAt]);

  return <Typography className="mb-4 h-6 font-medium">{timeLeft}</Typography>;
};

const DraftActions = ({
  quest,
  maxVote,
}: {
  quest: DAOQuestDraft;
  maxVote: number;
}) => {
  const { quest_key, dao_draft_end_at, total_vote, quest_start_block } = quest;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract({
    config: wagmiConfig,
  });
  const [voteType, setVoteType] = useState<VoteDraftOption | null>(null);

  const isEnded = dayjs(dao_draft_end_at).isBefore(dayjs());

  const handleAction = async (type: VoteDraftOption) => {
    if (!address) {
      toast({
        title: 'Please connect your wallet first',
      });
    }

    setVoteType(type);
    voteDraft(type);
  };

  const { mutate: voteDraft, isPending: isVoting } = useMutation({
    mutationKey: ['vote-draft', quest_key],
    mutationFn: async (type: VoteDraftOption) => {
      const { data: voteDetail } = await api.getVoteDetail(
        quest_key,
        address as string,
      );

      if (voteDetail?.vote_draft_tx) {
        throw new Error(`You've already voted for this quest`);
      }

      // FIXME move to hook
      const votePower = await readContract(wagmiConfig, {
        abi: nftContractABI,
        address: Env.NEXT_PUBLIC_NFT_ADDRESS as Address,
        functionName: 'getPastVotes',
        args: [address, quest_start_block],
      });

      if (!votePower || Number(votePower) === 0) {
        throw new Error('You don\'t have enough voting power');
      }

      if (Number(votePower) + total_vote > maxVote) {
        throw new Error('This quest has reached the maximum number of votes');
      }

      const args = [quest_key, type];

      const params = {
        address: Env.NEXT_PUBLIC_GOVERNANCE_ADDRESS as Address,
        abi: governanceContractABI,
        functionName: 'voteQuest',
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

      const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
      });

      if (transactionReceipt.status === 'success') {
        const logs = parseEventLogs({
          abi: governanceContractABI,
          eventName: 'VoteQuestCast',
          logs: transactionReceipt.logs,
        });

        if (!logs || logs.length <= 0) {
          throw new Error('An unexpected error has occurred');
        }

        const log = logs[0] as any;
        const power = Number(log?.args?.votes ?? 5);

        await api.voteQuest({
          quest_key: quest_key as string,
          voter: address as string,
          tx: transactionReceipt.transactionHash as string,
          power,
          option: type,
        });
      } else {
        throw new Error('Oops! Something went wrong');
      }

      return true;
    },
    onSuccess: async () => {
      toast({
        title: 'Vote successful',
        variant: 'success',
      });

      queryClient.invalidateQueries({
        queryKey: [...appQueryKeys.quests.dao, 'draft'].filter(Boolean),
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
    onSettled: () => {
      setVoteType(null);
    },
  });

  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={() => handleAction('approve')}
        loading={isVoting && voteType === 'approve'}
        variant="outline"
        disabled={isEnded || voteType === 'reject'}
      >
        Approve
      </Button>
      <Button
        onClick={() => handleAction('reject')}
        loading={isVoting && voteType === 'reject'}
        variant="outline"
        disabled={isEnded || voteType === 'approve'}
      >
        Reject
      </Button>
    </div>
  );
};

const SuccessActions = ({ quest }: { quest: DAOQuestSuccess }) => {
  const { quest_key, dao_success_end_at } = quest;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract({
    config: wagmiConfig,
  });
  const [voteType, setVoteType] = useState<VoteSuccessOption | null>(null);

  const isEnded = dayjs(dao_success_end_at).isBefore(dayjs());

  const handleAction = async (type: VoteSuccessOption) => {
    if (!address) {
      toast({
        title: 'Please connect your wallet first',
      });
    }

    setVoteType(type);
    voteDraft(type);
  };

  const { mutate: voteDraft, isPending: isVoting } = useMutation({
    mutationKey: ['vote-draft', quest_key],
    mutationFn: async (type: VoteSuccessOption) => {
      if (isEnded) {
        throw new Error('The voting period has ended');
      }

      const { data: voteDetail } = await api.getVoteDetail(
        quest.quest_key,
        address as string,
      );

      if (!voteDetail || !voteDetail.vote_draft_tx) {
        throw new Error('You are not allowed to vote for this quest');
      }

      if (voteDetail.vote_success_tx) {
        throw new Error('You\'ve already voted for this quest');
      }

      // const votePower = await readContract(wagmiConfig, {
      //   abi: nftContractABI,
      //   address: Env.NEXT_PUBLIC_NFT_ADDRESS as Address,
      //   functionName: "getPastVotes",
      //   args: [address, quest_start_block],
      // });

      // if (!votePower || Number(votePower) === 0) {
      //   throw new Error("You don't have enough voting power");
      // }

      // if (Number(votePower) + total_vote > quest.total_vote) {
      //   throw new Error("This quest has reached the maximum number of votes");
      // }

      const args = [quest.quest_key, type];

      const params = {
        address: Env.NEXT_PUBLIC_GOVERNANCE_ADDRESS as Address,
        abi: governanceContractABI,
        functionName: 'voteDecision',
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

      const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
      });

      if (transactionReceipt.status === 'success') {
        await api.voteSuccessQuest({
          quest_key: quest.quest_key as string,
          voter: address as string,
          tx: transactionReceipt.transactionHash as string,
          option: type,
        });
      } else {
        throw new Error('Oops! Something went wrong');
      }

      return true;
    },
    onSuccess: async () => {
      toast({
        title: 'Vote successful',
        variant: 'success',
      });

      queryClient.invalidateQueries({
        queryKey: [...appQueryKeys.quests.dao, 'success'].filter(Boolean),
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
    onSettled: () => {
      setVoteType(null);
    },
  });

  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={() => handleAction('success')}
        loading={isVoting && voteType === 'success'}
        variant="outline"
        disabled={isEnded || voteType === 'adjourn'}
      >
        Success
      </Button>
      <Button
        onClick={() => handleAction('adjourn')}
        loading={isVoting && voteType === 'adjourn'}
        variant="outline"
        disabled={isEnded || voteType === 'success'}
      >
        Adjourn
      </Button>
    </div>
  );
};

const AnswerActions = ({ quest }: { quest: DAOQuestAnswer }) => {
  const { dao_answer_end_at } = quest;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract({
    config: wagmiConfig,
  });

  const [answer, setAnswer] = useState('');

  const isEnded = dayjs(dao_answer_end_at).isBefore(dayjs());

  const { mutate: voteAnswer, isPending: isVoting } = useMutation({
    mutationKey: ['vote-answer', quest.quest_key],
    mutationFn: async (answer: string) => {
      if (isEnded) {
        throw new Error('The voting period has ended');
      }

      const { data: voteDetail } = await api.getVoteDetail(
        quest.quest_key,
        address as string,
      );

      if (
        !voteDetail
        || !voteDetail.vote_draft_tx
        || !voteDetail.vote_success_tx
      ) {
        throw new Error('You are not allowed to vote for this quest');
      }

      if (voteDetail.vote_answer_tx) {
        throw new Error('You\'ve already voted for this quest');
      }

      const args = [quest.quest_key, answer];

      const params = {
        address: Env.NEXT_PUBLIC_GOVERNANCE_ADDRESS as Address,
        abi: governanceContractABI,
        functionName: 'voteAnswer',
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

      const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
      });

      if (transactionReceipt.status === 'success') {
        await api.voteAnswerQuest({
          quest_key: quest.quest_key,
          voter: address as string,
          tx: transactionReceipt.transactionHash as string,
          answer_key: answer,
        });
      } else {
        throw new Error('Oops! Something went wrong');
      }

      return true;
    },
    onSuccess: async () => {
      toast({
        title: 'Vote successful',
        variant: 'success',
      });

      queryClient.invalidateQueries({
        queryKey: [...appQueryKeys.quests.dao, 'answer'].filter(Boolean),
      });

      setAnswer('');
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

  const handleAction = async () => {
    if (!address) {
      toast({
        title: 'Please connect your wallet first',
        variant: 'danger',
      });
      return;
    }

    if (!answer) {
      toast({
        title: 'Please choose your answer',
        variant: 'danger',
      });
      return;
    }

    voteAnswer(answer);
  };

  return (
    <div className="flex items-start gap-10">
      <div className="flex-1 space-y-2">
        <Select value={answer} onValueChange={setAnswer}>
          <SelectTrigger>
            <SelectValue placeholder="Please choose your answer" />
          </SelectTrigger>
          <SelectContent>
            {quest.answers.map(answer => (
              <SelectItem key={answer.answer_key} value={answer.answer_key}>
                {answer.answer_title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Typography>Please choose your answer in here.</Typography>
      </div>

      <div className="flex items-center gap-4">
        <Button
          loading={isVoting}
          onClick={handleAction}
          disabled={!answer || isEnded}
          variant="outline"
        >
          Approve
        </Button>
      </div>
    </div>
  );
};

const formatTimeLeft = (diff: number): string => {
  if (diff <= 0) {
    return '';
  }

  const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  return `${hrs.toString().padStart(2, '0')}:${mins
    .toString()
    .padStart(
      2,
      '0',
    )}:${secs.toString().padStart(2, '0')}s will be close this vote.`;
};
