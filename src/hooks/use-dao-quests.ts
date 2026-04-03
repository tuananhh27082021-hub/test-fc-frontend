import type { DefaultError, UseMutationOptions } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { parseAsStringLiteral, useQueryState } from 'nuqs';

import { appQueryKeys, storageKey } from '@/config/query';
import api from '@/libs/api';
import type {
  AuthHeaderRequest,
  BaseResponse,
  GetAdminQuestsRequest,
} from '@/types/schema';

import { useSessionStorage } from './use-storage';

export const useFilterAdminQuests = () => {
  const filterOptions = [
    'draft',
    'publish',
    'decision',
    'answer',
    'success',
    'adjourn',
    'ongoing',
    'archived',
  ] as const;

  const [status, setStatus] = useQueryState(
    'status',
    parseAsStringLiteral(filterOptions).withDefault('ongoing'),
  );

  return {
    status,
    setStatus,
  };
};

export const useFetchDAOQuests = (
  params: Omit<GetAdminQuestsRequest, 'message' | 'signature'>,
) => {
  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useQuery({
    queryKey: [
      ...appQueryKeys.dao.root,
      params.status,
      params.page,
      params.size,
    ].filter(Boolean),
    queryFn: () =>
      api.getAdminQuests({
        message: value.message,
        signature: value.signature,
        ...params,
      }),
    refetchOnMount: 'always',
    staleTime: 0,
  });
};

export function useAdminSetDraftQuestMutation(
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

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.setDraft, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminDraftSetQuest(questKey, value);
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

export function useAdminCancelDraftQuestMutation(
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

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.cancelDraft, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminDraftCancelQuest(questKey, value);
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

export function useAdminMakeDraftQuestMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.make, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminMakeDraftQuest(questKey, value);
    },

    ...rest,
  });
}

export function useAdminPublishQuestMutation(
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

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.publish, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminPublishQuest(questKey, value);
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

export function useAdminFinishQuestMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.finish, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminFinishQuest(questKey, value);
    },

    ...rest,
  });
}

export function useAdminStartDAOSuccessQuestMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.startDAOSuccess, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminStartDAOSuccessQuest(questKey, value);
    },

    ...rest,
  });
}

export function useAdminSetDaoSuccessMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.setDAOSuccess, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminSetDaoSuccess(questKey, value);
    },

    ...rest,
  });
}

export function useAdminAdjournQuestMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.adjournDAOSuccess, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminAdjournQuest(questKey, value);
    },

    ...rest,
  });
}

export function useAdminMakeDaoSuccessMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.makeDAOSuccess, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminMakeDaoSuccess(questKey, value);
    },

    ...rest,
  });
}

export function useAdminSetDAOAnswerMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.setDAOAnswer, ...mutationKey],

    mutationFn: ({
      questKey,
      answerKey,
    }: {
      questKey: string;
      answerKey: string;
    }) => {
      return api.adminSetDAOAnswer(questKey, answerKey, value);
    },

    ...rest,
  });
}

export function useAdminSetQuestSuccessMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.setSuccess, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminSetQuestSuccess(questKey, value);
    },

    ...rest,
  });
}

export function useAdminSetHotQuestSuccessMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.setSuccess, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminSetHotQuest(questKey, value);
    },

    ...rest,
  });
}

export function useAdminArchiveQuestMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.archive, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminArchiveQuest(questKey, value);
    },

    ...rest,
  });
}

export function useAdminUnarchiveQuestMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: [...appQueryKeys.dao.unarchive, ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminUnarchiveQuest(questKey, value);
    },

    ...rest,
  });
}

// for testing
export function useAdminForceDraftEndMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: ['admin-force-draft-end', ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminForceDraftEnd(questKey, value);
    },

    ...rest,
  });
}

export function useAdminForceSuccessEndMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: ['admin-force-success-end', ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminForceSuccessEnd(questKey, value);
    },

    ...rest,
  });
}

export function useAdminForceAnswerEndMutation(
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
  const { mutationKey = [], ...rest } = options || {};

  const [value] = useSessionStorage<AuthHeaderRequest>(
    storageKey.signedMessage,
    { message: '', signature: '' },
  );

  return useMutation({
    mutationKey: ['admin-force-answer-end', ...mutationKey],

    mutationFn: (questKey: string) => {
      return api.adminForceAnswerEnd(questKey, value);
    },

    ...rest,
  });
}
