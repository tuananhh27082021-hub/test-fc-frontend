'use client';

import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useMemo } from 'react';

import { appQueryKeys } from '@/config/query';
import { useGetGovernanceConfig } from '@/hooks/use-contract';
import {
  useAdminAdjournQuestMutation,
  useAdminArchiveQuestMutation,
  useAdminCancelDraftQuestMutation,
  useAdminFinishQuestMutation,
  useAdminMakeDaoSuccessMutation,
  useAdminMakeDraftQuestMutation,
  useAdminPublishQuestMutation,
  useAdminSetDAOAnswerMutation,
  useAdminSetDaoSuccessMutation,
  useAdminSetDraftQuestMutation,
  useAdminSetHotQuestSuccessMutation,
  useAdminSetQuestSuccessMutation,
  useAdminStartDAOSuccessQuestMutation,
  useAdminUnarchiveQuestMutation,
} from '@/hooks/use-dao-quests';
import { useToast } from '@/hooks/use-toast';
import type {
  AdminAnswerQuest,
  AdminDecisionQuest,
  AdminDraftQuest,
  AdminPubishQuest,
  AdminQuestStatus,
  BaseAdminQuest,
} from '@/types/schema';

export const useAdminMutations = (effectiveStatus: AdminQuestStatus) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const invalidateQuestQueries = () => {
    queryClient.invalidateQueries({
      queryKey: [...appQueryKeys.dao.root].filter(Boolean),
    });
  };

  const handleError = (error: any) => {
    console.error(error);
    toast({
      title: 'Oops! Something went wrong',
      description: error?.message,
      variant: 'danger',
    });
  };

  const createMutation = (mutateFn: any, successMessage: string) => {
    return mutateFn({
      mutationKey: [],
      onSuccess: () => {
        toast({ title: successMessage });
        invalidateQuestQueries();
      },
      onError: handleError,
    });
  };

  // Mutations
  const { mutate: setDraftQuest, isPending: isSettingDraft } = createMutation(
    useAdminSetDraftQuestMutation,
    'Draft quest set successfully',
  );

  const { mutate: cancelDraftQuest, isPending: isCancelingDraft }
    = createMutation(useAdminCancelDraftQuestMutation, 'Draft quest canceled');

  const { mutate: publishQuest, isPending: isPublishingQuest } = createMutation(
    useAdminPublishQuestMutation,
    'Quest published successfully',
  );

  const { mutate: makeDraftQuest, isPending: isMakingDraftQuest }
    = createMutation(
      useAdminMakeDraftQuestMutation,
      'Draft quest updated successfully',
    );

  const { mutate: finishQuest, isPending: isFinishingQuest } = createMutation(
    useAdminFinishQuestMutation,
    'Quest marked as finished',
  );

  const { mutate: startDaoSuccess, isPending: isStartingDaoSuccess }
    = createMutation(useAdminStartDAOSuccessQuestMutation, 'Started DAO success');

  const { mutate: setDaoSuccess, isPending: isSettingDaoSuccess }
    = createMutation(useAdminSetDaoSuccessMutation, 'DAO success set');

  const { mutate: adjournQuest, isPending: isAdjourning } = createMutation(
    useAdminAdjournQuestMutation,
    'Quest adjourned',
  );

  const { mutate: makeDaoSuccess, isPending: isMakingDaoSuccess }
    = createMutation(useAdminMakeDaoSuccessMutation, 'DAO success made');

  const { mutate: setAnswer, isPending: isSettingAnswer } = createMutation(
    useAdminSetDAOAnswerMutation,
    'Answer set successfully',
  );

  const { mutate: setSuccessQuest, isPending: isSettingSuccessQuest }
    = createMutation(useAdminSetQuestSuccessMutation, 'Answer set successfully');

  const { mutate: adminSetHotQuest, isPending: isHotSetting }
    = useAdminSetHotQuestSuccessMutation({
      mutationKey: [],
      onSuccess: () => {
        toast({
          title: 'Update Quest Successfully',
          variant: 'success',
        });
        queryClient.invalidateQueries({
          queryKey: [...appQueryKeys.dao.root, effectiveStatus].filter(Boolean),
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

  const { mutate: adminArchiveQuest, isPending: isArchiving }
    = useAdminArchiveQuestMutation({
      mutationKey: [],
      onSuccess: () => {
        toast({
          title: 'Quest Archived Successfully',
          variant: 'success',
        });

        queryClient.invalidateQueries({
          queryKey: [...appQueryKeys.dao.root, effectiveStatus].filter(Boolean),
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

  const { mutate: adminUnarchiveQuest, isPending: isUnarchiving }
    = useAdminUnarchiveQuestMutation({
      mutationKey: [],
      onSuccess: () => {
        toast({
          title: 'Quest Unarchived Successfully',
          variant: 'success',
        });

        queryClient.invalidateQueries({
          queryKey: [...appQueryKeys.dao.root, effectiveStatus].filter(Boolean),
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

  return {
    // Mutations
    setDraftQuest,
    cancelDraftQuest,
    publishQuest,
    makeDraftQuest,
    finishQuest,
    startDaoSuccess,
    setDaoSuccess,
    adjournQuest,
    makeDaoSuccess,
    setAnswer,
    setSuccessQuest,
    adminSetHotQuest,
    adminArchiveQuest,
    adminUnarchiveQuest,
    // Loading states
    isSettingDraft,
    isCancelingDraft,
    isPublishingQuest,
    isMakingDraftQuest,
    isFinishingQuest,
    isStartingDaoSuccess,
    isSettingDaoSuccess,
    isAdjourning,
    isMakingDaoSuccess,
    isSettingAnswer,
    isSettingSuccessQuest,
    isHotSetting,
    invalidateQuestQueries,
    isArchiving,
    isUnarchiving,
  };
};

export const useAdminButtonStates = (
  selectedQuest: BaseAdminQuest | null,
  effectiveStatus: AdminQuestStatus,
  mutations: ReturnType<typeof useAdminMutations>,
) => {
  const { minVote } = useGetGovernanceConfig();

  return useMemo(() => {
    const quest = selectedQuest;
    if (!quest) {
      return {};
    }

    if (effectiveStatus === 'draft') {
      const draftQuest = quest as AdminDraftQuest;
      const isDraftEnded
        = !!draftQuest.dao_draft_end_at
          && dayjs().isAfter(dayjs(draftQuest.dao_draft_end_at));
      const hasEnoughVote = draftQuest.total_vote >= minVote;
      const canSetDraftEnd
        = draftQuest.quest_status === 'DRAFT' && isDraftEnded && hasEnoughVote;
      const canPublish = isDraftEnded && draftQuest.quest_status === 'APPROVE';

      return {
        canSetDraftResult: canSetDraftEnd,
        canPublish,
        canReject: true,
        isSettingDraft:
          mutations.isSettingDraft || mutations.isMakingDraftQuest,
        isPublishing: mutations.isPublishingQuest,
        isCanceling: mutations.isCancelingDraft,
      };
    }

    if (effectiveStatus === 'publish') {
      const publishQuest = quest as AdminPubishQuest;
      const canFinish = publishQuest.quest_status === 'PUBLISH';
      const canStartDAOSuccess = publishQuest.quest_status === 'FINISH';

      return {
        canFinish,
        canStartDAOSuccess,
        isFinishing: mutations.isFinishingQuest,
        isStartingDaoSuccess: mutations.isStartingDaoSuccess,
      };
    }

    if (effectiveStatus === 'decision') {
      const decisionQuest = quest as AdminDecisionQuest;
      const isSuccessEnded
        = !!decisionQuest.dao_success_end_at
          && dayjs().isAfter(dayjs(decisionQuest.dao_success_end_at));
      const hasEnoughVote = decisionQuest.total_vote >= minVote;
      const canSetDecision
        = isSuccessEnded
          && hasEnoughVote
          && decisionQuest.quest_status === 'FINISH';
      const canSetAdjourn = decisionQuest.quest_status === 'FINISH';

      return {
        canSetDecision,
        canSetAdjourn,
        isSettingDaoSuccess:
          mutations.isSettingDaoSuccess || mutations.isMakingDaoSuccess,
        isAdjourning: mutations.isAdjourning,
      };
    }

    if (effectiveStatus === 'answer') {
      const answerQuest = quest as AdminAnswerQuest;
      const hasEnoughVote = answerQuest.total_vote >= minVote;
      const canSetAnswer
        = hasEnoughVote
          && answerQuest.quest_status === 'DAO_SUCCESS'
          && !answerQuest.answer_selected;
      const canSetSuccess
        = answerQuest.quest_status === 'DAO_SUCCESS'
          && !!answerQuest.answer_selected;

      return {
        canSetAnswer,
        canSetSuccess,
        isSettingAnswer: mutations.isSettingAnswer,
        isSettingSuccess: mutations.isSettingSuccessQuest,
        isAdjourning: mutations.isAdjourning,
      };
    }

    return {};
  }, [selectedQuest, effectiveStatus, mutations, minVote]);
};
