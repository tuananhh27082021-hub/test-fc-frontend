import type { DefaultError, UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { parseAsStringLiteral, useQueryState } from 'nuqs';

import { appQueryKeys } from '@/config/query';
import api from '@/libs/api';
import type {
  BaseResponse,
  ClaimDailyRewardParams,
  UpdateMemberDelegateRequest,
} from '@/types/schema';

export const useCheckMember = (message: string, signature?: string) => {
  return useQuery({
    queryKey: [...appQueryKeys.member.check, message, signature].filter(
      Boolean,
    ),
    enabled: !!signature,
    queryFn: () => api.memberCheck(message, signature!),
  });
};

export const useGetMember = (wallet?: string, refCode?: string) => {
  return useQuery({
    queryKey: [...appQueryKeys.member.root, wallet].filter(Boolean),
    enabled: !!wallet,
    queryFn: () => api.getMember(wallet!, refCode),
  });
};

export const useGetMemberVotings = (wallet: string) => {
  return useQuery({
    queryKey: [...appQueryKeys.member.votings, wallet].filter(Boolean),
    queryFn: () => api.getMemberVotings({ wallet }),
  });
};

export const useGetMemberBettings = (wallet: string) => {
  return useQuery({
    queryKey: [...appQueryKeys.member.bettings, wallet].filter(Boolean),
    queryFn: () => api.getMemberBettings({ wallet }),
  });
};

export const useGetMemberReferrals = (wallet?: string) => {
  return useQuery({
    queryKey: ['member-referrals', wallet].filter(Boolean),
    enabled: !!wallet,
    queryFn: () => api.getListReferral(wallet!),
  });
};

export function useUpdateMemberDelegateMutation(
  options?: Pick<
    UseMutationOptions<
      Awaited<BaseResponse<any>>,
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

    mutationFn: (body: UpdateMemberDelegateRequest) => {
      return api.updateMemberDelegate(body);
    },

    onMutate: async (variables) => {
      await Promise.all([onMutate?.(variables)]);
    },

    onSuccess: async (response, variables, context) => {
      await onSuccess?.(response, variables, context);
    },

    onError,

    onSettled: async (response, error, variables, context) => {
      await Promise.all([
        onSettled?.(response, error, variables, context),
      ]);
    },
  });
}

export const useFilterProfileData = () => {
  const filterOptions = ['games', 'history'] as const;

  const [type, setType] = useQueryState(
    'type',
    parseAsStringLiteral(filterOptions).withDefault('games'),
  );

  return {
    type,
    setType,
  };
};

export function useClaimDailyRewardMutation(
  options?: Pick<
    UseMutationOptions<
      Awaited<BaseResponse<any>>,
      DefaultError,
      unknown,
      unknown
    >,
        'mutationKey' | 'onMutate' | 'onSuccess' | 'onError' | 'onSettled'
  >,
) {
  const { mutationKey = [], ...rest } = options || {};

  return useMutation({
    mutationKey: [appQueryKeys.member.claimDailyReward, ...mutationKey],

    mutationFn: (params: ClaimDailyRewardParams) => {
      return api.claimDailyReward(params);
    },

    ...rest,
  });
}

export const useGetDailyReward = (wallet?: string) => {
  return useQuery({
    queryKey: [...appQueryKeys.member.getDailyReward, wallet].filter(
      Boolean,
    ),
    enabled: !!wallet,
    queryFn: () => api.getDailyReward(wallet!, new Date().toISOString()),
  });
};
