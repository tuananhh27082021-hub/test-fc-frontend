import { useQueryClient } from '@tanstack/react-query';
import type { RowSelectionState, Table } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { useMemo } from 'react';

import { appQueryKeys } from '@/config/query';
import { useGetGovernanceConfig } from '@/hooks/use-contract';
import {
  useAdminAdjournQuestMutation,
  useAdminArchiveQuestMutation,
  useAdminCancelDraftQuestMutation,
  useAdminFinishQuestMutation,
  useAdminForceSuccessEndMutation,
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
// import { Env } from "@/libs/Env";
import type {
  AdminAnswerQuest,
  AdminDecisionQuest,
  AdminPubishQuest,
  AdminQuestStatus,
  BaseAdminQuest,
} from '@/types/schema';

import { Button } from '../ui/button';

export const TableActions = ({
  table,
  status,
  rowSelection,
  selectedAnswers,
}: {
  table: Table<BaseAdminQuest>;
  status: AdminQuestStatus;
  rowSelection: RowSelectionState;
  selectedAnswers?: Record<string, string>;
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { minVote } = useGetGovernanceConfig();

  const row = useMemo(() => {
    return table.getFilteredSelectedRowModel().rows?.[0]?.original;
  }, [rowSelection]);

  const invalidateQuestQueries = () => {
    queryClient.invalidateQueries({
      queryKey: [...appQueryKeys.dao.root].filter(Boolean),
    });

    table.resetRowSelection();
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

  const { isPending: isSettingDraft } = createMutation(
    useAdminSetDraftQuestMutation,
    'Draft quest set successfully',
  );

  const { mutate: cancelDraftQuest, isPending: isCancelingDraft }
    = createMutation(useAdminCancelDraftQuestMutation, 'Draft quest canceled');

  const { mutate: publishQuest, isPending: isPublishingQuest } = createMutation(
    useAdminPublishQuestMutation,
    'Quest published successfully',
  );

  const { isPending: isMakingDraftQuest } = createMutation(
    useAdminMakeDraftQuestMutation,
    'Draft quest updated successfully',
  );

  const { mutate: finishQuest, isPending: isFinishingQuest } = createMutation(
    useAdminFinishQuestMutation,
    'Quest marked as finished',
  );

  const { isPending: isStartingDaoSuccess } = createMutation(
    useAdminStartDAOSuccessQuestMutation,
    'Started DAO success',
  );

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

  // ongoing
  const { mutate: adminSetHotQuest, isPending: isHotSetting }
    = useAdminSetHotQuestSuccessMutation({
      mutationKey: [],
      onSuccess: () => {
        toast({
          title: 'Update Quest Successfully',
          variant: 'success',
        });

        queryClient.invalidateQueries({
          queryKey: [...appQueryKeys.dao.root, status].filter(Boolean),
        });

        table.resetRowSelection();
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
          queryKey: [...appQueryKeys.dao.root, status].filter(Boolean),
        });

        table.resetRowSelection();
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
          queryKey: [...appQueryKeys.dao.root, status].filter(Boolean),
        });

        table.resetRowSelection();
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

  const { mutate: forceSuccessEnd, isPending: isForcingSuccessEnd }
    = createMutation(useAdminForceSuccessEndMutation, 'Success forcibly ended');

  let view: React.ReactNode = null;

  if (status === 'draft') {
    // const quest = row as AdminDraftQuest | undefined;

    // const isDraftEnded =
    //   !!quest &&
    //   !!quest.dao_draft_end_at &&
    //   dayjs().isAfter(dayjs(quest.dao_draft_end_at));

    // const hasEnoughVote = quest && quest.total_vote >= minVote;

    // const canSetDraftEnd =
    //   !!quest &&
    //   quest.quest_status === 'DRAFT' &&
    //   isDraftEnded &&
    //   hasEnoughVote;

    // const canPublish = isDraftEnded && quest.quest_status === 'APPROVE';

    // const canForceDraft =
    //   !!quest && quest.total_approve_power === quest.total_reject_power;

    view = (
      <>
        {/* <Button
          disabled={
            table.getFilteredSelectedRowModel().rows.length === 0 ||
            isCancelingDraft ||
            isPublishingQuest ||
            !canSetDraftEnd
          }
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original) {
              if (canForceDraft) {
                makeDraftQuest(row.original.quest_key);
              } else {
                setDraftQuest(row.original.quest_key);
              }
            }
          }}
          variant="noShadow"
          loading={isSettingDraft || isMakingDraftQuest}
        >
          Set Draft Result
        </Button> */}
        <Button
          disabled={table.getFilteredSelectedRowModel().rows.length === 0}
          loading={isPublishingQuest}
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original) {
              publishQuest(row.original.quest_key);
            }
          }}
          variant="noShadow"
        >
          Publish
        </Button>
        <Button
          disabled={
            table.getFilteredSelectedRowModel().rows.length === 0
            || isSettingDraft
            || isMakingDraftQuest
            || isPublishingQuest
          }
          loading={isCancelingDraft}
          variant="noShadow"
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original) {
              cancelDraftQuest(row.original.quest_key);
            }
          }}
        >
          Reject
        </Button>
        {/* {Env.NEXT_PUBLIC_NETWORK === 'testnet' && (
          <Button
            disabled={table.getFilteredSelectedRowModel().rows.length === 0}
            loading={isForcingDraftEnd}
            variant="noShadow"
            onClick={() => {
              const row = table.getFilteredSelectedRowModel().rows?.[0];
              if (row && row.original) {
                forceDraftEnd(row.original.quest_key);
              }
            }}
          >
            Force End (For test)
          </Button>
        )} */}
        {/* <Button
          disabled={table.getFilteredSelectedRowModel().rows.length === 0}
          loading={isForcingDraftEnd}
          variant="noShadow"
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original) {
              forceDraftEnd(row.original.quest_key);
            }
          }}
        >
          Force End (For test)
        </Button> */}
      </>
    );
  } else if (status === 'publish') {
    const quest = row as AdminPubishQuest | undefined;
    const canFinish = quest && quest.quest_status === 'PUBLISH';
    // const canStartDAOSuccess = quest && quest.quest_status === 'FINISH';

    view = (
      <>
        <Button
          disabled={
            table.getFilteredSelectedRowModel().rows.length === 0
            || isStartingDaoSuccess
            || !canFinish
          }
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original) {
              finishQuest(row.original.quest_key);
            }
          }}
          variant="noShadow"
          loading={isFinishingQuest}
        >
          Finish
        </Button>

        {/* <Button
          disabled={
            table.getFilteredSelectedRowModel().rows.length === 0 ||
            isFinishingQuest ||
            !canStartDAOSuccess
          }
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original) {
              startDaoSuccess(row.original.quest_key);
            }
          }}
          variant="noShadow"
          loading={isStartingDaoSuccess}
        >
          Start DAO Success
        </Button> */}
      </>
    );
  } else if (status === 'decision') {
    const quest = row as AdminDecisionQuest | undefined;

    const isSuccessEnded
      = !!quest
        && !!quest.dao_success_end_at
        && dayjs().isAfter(dayjs(quest.dao_success_end_at));

    const hasEnoughVote = quest && quest.total_vote >= minVote;

    const canSetDecision
      = isSuccessEnded && hasEnoughVote && quest.quest_status === 'FINISH';
    const canSetAdjourn = quest && quest.quest_status === 'FINISH';

    view = (
      <>
        <Button
          disabled={
            table.getFilteredSelectedRowModel().rows.length === 0
            || isAdjourning
            || !canSetDecision
          }
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];

            if (!row || !row.original) {
              return;
            }

            const quest = row.original as AdminDecisionQuest;

            if (quest.total_adjourn_power === quest.total_success_power) {
              makeDaoSuccess(row.original.quest_key);
              return;
            }

            setDaoSuccess(row.original.quest_key);
          }}
          variant="noShadow"
          loading={isSettingDaoSuccess || isMakingDaoSuccess}
        >
          Set Decision
        </Button>

        <Button
          disabled={
            table.getFilteredSelectedRowModel().rows.length === 0
            || isSettingDaoSuccess
            || isMakingDaoSuccess
            || !canSetAdjourn
          }
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original) {
              adjournQuest(row.original.quest_key);
            }
          }}
          variant="noShadow"
          loading={isAdjourning}
        >
          Adjourn
        </Button>
        {/* {Env.NEXT_PUBLIC_NETWORK === "testnet" && (
          <Button
            disabled={table.getFilteredSelectedRowModel().rows.length === 0}
            loading={isForcingSuccessEnd}
            variant="noShadow"
            onClick={() => {
              const row = table.getFilteredSelectedRowModel().rows?.[0];
              if (row && row.original) {
                forceSuccessEnd(row.original.quest_key);
              }
            }}
          >
            Force End (For test)
          </Button>
        )} */}
        <Button
          disabled={table.getFilteredSelectedRowModel().rows.length === 0}
          loading={isForcingSuccessEnd}
          variant="noShadow"
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original) {
              forceSuccessEnd(row.original.quest_key);
            }
          }}
        >
          Force End (For test)
        </Button>
      </>
    );
  } else if (status === 'answer') {
    const quest = row as AdminAnswerQuest | undefined;

    // const hasEnoughVote = quest && quest.total_vote >= minVote;
    const hasSelectedAnswer = quest && selectedAnswers?.[quest.quest_key];

    // const canSetAnswer =
    //   hasEnoughVote &&
    //   quest?.quest_status === 'DAO_SUCCESS' &&
    //   !quest.answer_selected &&
    //   hasSelectedAnswer;

    const canSetSuccess
      = quest && quest.quest_status === 'DAO_SUCCESS' && !!quest.answer_selected;

    view = (
      <>
        <Button
          disabled={!hasSelectedAnswer}
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original && selectedAnswers) {
              const questKey = row.original.quest_key;
              const answerKey = selectedAnswers[questKey];
              if (answerKey) {
                setAnswer({ questKey, answerKey });
              }
            }
          }}
          variant="noShadow"
          loading={isSettingAnswer}
        >
          Set Answer
        </Button>

        <Button
          disabled={
            table.getFilteredSelectedRowModel().rows.length === 0
            || isSettingAnswer
            || isSettingSuccessQuest
          }
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original) {
              adjournQuest(row.original.quest_key);
            }
          }}
          variant="noShadow"
          loading={isAdjourning}
        >
          Cancel
        </Button>

        <Button
          disabled={
            table.getFilteredSelectedRowModel().rows.length === 0
            || isSettingAnswer
            || isAdjourning
            || !canSetSuccess
          }
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original) {
              setSuccessQuest(row.original.quest_key);
            }
          }}
          variant="noShadow"
          loading={isSettingSuccessQuest}
        >
          Success
        </Button>
      </>
    );
  } else if (status === 'ongoing') {
    view = (
      <>
        <Button
          disabled={table.getFilteredSelectedRowModel().rows.length === 0}
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original) {
              adminSetHotQuest(row.original.quest_key);
            }
          }}
          variant="noShadow"
          loading={isHotSetting}
        >
          HOT
        </Button>

        <Button
          disabled={table.getFilteredSelectedRowModel().rows.length === 0}
          onClick={() => {
            const row = table.getFilteredSelectedRowModel().rows?.[0];
            if (row && row.original) {
              adminArchiveQuest(row.original.quest_key);
            }
          }}
          variant="noShadow"
          loading={isArchiving}
        >
          Archive
        </Button>
      </>
    );
  } else if (status === 'archived') {
    view = (
      <Button
        disabled={table.getFilteredSelectedRowModel().rows.length === 0}
        onClick={() => {
          const row = table.getFilteredSelectedRowModel().rows?.[0];
          if (row && row.original) {
            adminUnarchiveQuest(row.original.quest_key);
          }
        }}
        variant="noShadow"
        loading={isUnarchiving}
      >
        Unarchive
      </Button>
    );
  }

  return <div className="mb-8 flex items-center gap-4">{view}</div>;
};
