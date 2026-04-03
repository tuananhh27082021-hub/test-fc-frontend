import type { DefaultError, UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';

import { appQueryKeys } from '@/config/query';
import api from '@/libs/api';
import type {
  AddQuestRequest,
  AddQuestResponse,
  BaseResponse,
  DraftQuestRequest,
  VoteQuestBody,
} from '@/types/schema';

export const useFetchQuest = (questId: string) => {
  return useQuery({
    queryKey: [...appQueryKeys.quest.root, questId].filter(Boolean),
    queryFn: () => api.getQuest(questId),
  });
};

export function useClaimBountyRewardMutation(
  options?: Pick<
    UseMutationOptions<
      Awaited<BaseResponse<boolean>>,
      DefaultError,
      unknown,
      unknown
    >,
    'mutationKey' | 'onMutate' | 'onSuccess' | 'onError' | 'onSettled'
  >,
) {
  const {
    mutationKey = [],
    onMutate,
    onSuccess,
    onError,
    onSettled,
  } = options || {};

  return useMutation({
    mutationKey: [...mutationKey],

    mutationFn: (quest: any) => {
      return api.claimBountyReward(quest);
    },

    onMutate: async (variables) => {
      await Promise.all([
        onMutate?.(variables),
      ]);
    },

    onSuccess: async (response, variables, context) => {
      await onSuccess?.(response, variables, context);
    },

    onError,

    onSettled: async (response, error, variables, context) => {
      await Promise.all([onSettled?.(response, error, variables, context)]);
    },
  });
}

export function useAddQuestMutation(
  options?: Pick<
    UseMutationOptions<
      Awaited<BaseResponse<AddQuestResponse>>,
      DefaultError,
      unknown,
      unknown
    >,
    'mutationKey' | 'onMutate' | 'onSuccess' | 'onError' | 'onSettled'
  >,
) {
  const {
    mutationKey = [],
    onMutate,
    onSuccess,
    onError,
    onSettled,
  } = options || {};

  return useMutation({
    mutationKey: [...appQueryKeys.quest.create, ...mutationKey],

    mutationFn: (quest: AddQuestRequest) => {
      return api.addQuest(quest);
    },

    onMutate: async (variables) => {
      await Promise.all([
        // queryClient.cancelQueries({ queryKey: [] }),
        onMutate?.(variables),
      ]);
    },

    onSuccess: async (response, variables, context) => {
      await onSuccess?.(response, variables, context);
    },

    onError,

    onSettled: async (response, error, variables, context) => {
      await Promise.all([onSettled?.(response, error, variables, context)]);
    },
  });
}

export function useDraftQuestMutation(
  options?: Pick<
    UseMutationOptions<
      Awaited<BaseResponse<string>>,
      DefaultError,
      unknown,
      unknown
    >,
    'mutationKey' | 'onMutate' | 'onSuccess' | 'onError' | 'onSettled'
  >,
) {
  const {
    mutationKey = [],
    onMutate,
    onSuccess,
    onError,
    onSettled,
  } = options || {};

  return useMutation({
    mutationKey: [...appQueryKeys.quest.draft, ...mutationKey],

    mutationFn: (params: DraftQuestRequest) => {
      return api.draftQuest(params);
    },

    onMutate: async (variables) => {
      await Promise.all([onMutate?.(variables)]);
    },

    onSuccess: async (response, variables, context) => {
      await onSuccess?.(response, variables, context);
    },

    onError,

    onSettled: async (response, error, variables, context) => {
      await Promise.all([onSettled?.(response, error, variables, context)]);
    },
  });
}

export function useVoteQuest(
  options?: Pick<
    UseMutationOptions<
      Awaited<BaseResponse<AddQuestResponse>>,
      DefaultError,
      unknown,
      unknown
    >,
    'mutationKey' | 'onMutate' | 'onSuccess' | 'onError' | 'onSettled'
  >,
) {
  const {
    mutationKey = [],
    onMutate,
    onSuccess,
    onError,
    onSettled,
  } = options || {};

  return useMutation({
    mutationKey: [...appQueryKeys.quest.vote, ...mutationKey],

    mutationFn: (body: VoteQuestBody) => {
      return api.voteQuest(body);
    },

    onMutate: async (variables) => {
      await Promise.all([onMutate?.(variables)]);
    },

    onSuccess: async (response, variables, context) => {
      await onSuccess?.(response, variables, context);
    },

    onError,

    onSettled: async (response, error, variables, context) => {
      await Promise.all([onSettled?.(response, error, variables, context)]);
    },
  });
}

export const useFetchQuestBettings = (
  questId: string,
  walletAddress?: string,
) => {
  return useQuery({
    queryKey: [...appQueryKeys.quest.bettings, questId, walletAddress].filter(
      Boolean,
    ),
    queryFn: () => api.getQuestBettings(questId, walletAddress),
  });
};
