'use client';

import { parseAsInteger, useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';

import { useAuth } from '@/app/auth-provider';
import { DEFAULT_PAGE_SIZE } from '@/config/constants';
import { useFetchDAOQuests } from '@/hooks/use-dao-quests';
import type { AdminQuestStatus, BaseAdminQuest } from '@/types/schema';
import { isSuperAdmin } from '@/utils/member';

import { Typography } from '../ui/typography';
import { withAdmin } from '../with-admin';
import { MobileAdminActions } from './mobile/mobile-admin-actions';
import { MobileAdminHeader } from './mobile/mobile-admin-header';
import {
  useAdminButtonStates,
  useAdminMutations,
} from './mobile/mobile-admin-hooks';
import {
  MobileAnswerView,
  MobileDecisionView,
  MobileDistributionView,
  MobileDraftView,
  MobileGrantsAdminView,
  MobileInProgressView,
  MobilePublishView,
  MobileSuccessView,
} from './mobile/mobile-admin-views';
import { MobileArchivedView } from './mobile/mobile-admin-views/mobile-archived-view';
import { MobileDistributeDialog } from './mobile/mobile-distribute-dialog';

interface MobileAdminTableProps {
  status: AdminQuestStatus;
}

export function MobileAdminTable({ status }: MobileAdminTableProps) {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useQueryState('page', parseAsInteger);
  const [selectedQuests, setSelectedQuests] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<string>('In Progress');
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<string, string>
  >({});
  const [showDistributeDialog, setShowDistributeDialog] = useState(false);

  const viewToStatus: Record<string, AdminQuestStatus> = useMemo(
    () => ({
      'In Progress': 'ongoing',
      'Draft': 'draft',
      'Publish': 'publish',
      'Decision': 'decision',
      'Answer': 'answer',
      'Success': 'success',
      'Adjourn': 'adjourn',
      'Archived': 'archived',
    }),
    [],
  );

  const effectiveStatus: AdminQuestStatus = viewToStatus[currentView] ?? status;

  const { data, isLoading } = useFetchDAOQuests({
    status: effectiveStatus,
    page: currentPage ?? 1,
  });

  const quests = useMemo(
    () => (data?.data?.quests ?? []) as BaseAdminQuest[],
    [data?.data?.quests],
  );
  const total = data?.data?.total ?? 0;
  const displayQuests = quests;
  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_PAGE_SIZE));

  // Get selected quest
  const selectedQuest = useMemo(() => {
    if (!selectedQuests) {
      return null;
    }
    return quests.find(q => q.quest_key === selectedQuests);
  }, [selectedQuests, quests]);

  // Use custom hooks
  const mutations = useAdminMutations(effectiveStatus);
  const buttonStates = useAdminButtonStates(
    selectedQuest || null,
    effectiveStatus,
    mutations,
  );

  // Button handlers
  const handleHotClick = () => {
    if (selectedQuest) {
      mutations.adminSetHotQuest(selectedQuest.quest_key);
    }
  };

  const handleArchiveClick = () => {
    if (selectedQuest) {
      mutations.adminArchiveQuest(selectedQuest.quest_key);
    }
  };

  const handleUnArchiveClick = () => {
    if (selectedQuest) {
      mutations.adminUnarchiveQuest(selectedQuest.quest_key);
    }
  };

  const handlePublish = () => {
    if (selectedQuest) {
      mutations.publishQuest(selectedQuest.quest_key);
    }
  };

  const handleReject = () => {
    if (selectedQuest) {
      mutations.cancelDraftQuest(selectedQuest.quest_key);
    }
  };

  const handleFinish = () => {
    if (selectedQuest) {
      mutations.finishQuest(selectedQuest.quest_key);
    }
  };

  const handleSetDecision = () => {
    if (selectedQuest) {
      const quest = selectedQuest as any;

      if (quest.total_adjourn_power === quest.total_success_power) {
        mutations.makeDaoSuccess(selectedQuest.quest_key);
      } else {
        mutations.setDaoSuccess(selectedQuest.quest_key);
      }
    }
  };

  const handleAdjourn = () => {
    if (selectedQuest) {
      mutations.adjournQuest(selectedQuest.quest_key);
    }
  };

  const handleSetAnswer = () => {
    if (selectedQuest) {
      const answerKey = selectedAnswers[selectedQuest.quest_key];
      if (answerKey) {
        mutations.setAnswer({
          questKey: selectedQuest.quest_key,
          answerKey,
        });
      }
    }
  };

  const handleCancel = () => {
    if (selectedQuest) {
      mutations.adjournQuest(selectedQuest.quest_key);
    }
  };

  const handleSuccess = () => {
    if (selectedQuest) {
      mutations.setSuccessQuest(selectedQuest.quest_key);
    }
  };

  const handleDistribute = () => {
    setShowDistributeDialog(true);
  };

  const handleQuestToggle = (questKey: string) => {
    if (selectedQuests === questKey) {
      setSelectedQuests(null);
    } else {
      setSelectedQuests(questKey);
    }
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    setCurrentPage(1);
    setSelectedQuests(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOptionSelect = (questKey: string, optionKey: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questKey]: optionKey,
    }));
    // Auto-select the quest when an answer is chosen
    setSelectedQuests(questKey);
  };

  const isUserSuperAdmin = useMemo(() => {
    return isSuperAdmin(user);
  }, [user]);

  const renderCurrentView = () => {
    const commonProps = {
      displayQuests,
      isLoading,
      selectedQuests,
      onQuestToggle: handleQuestToggle,
      currentPage,
      totalPages,
      onPageChange: handlePageChange,
    };

    switch (currentView) {
      case 'In Progress':
        return <MobileInProgressView {...commonProps} />;
      case 'Draft':
        return <MobileDraftView {...commonProps} />;
      case 'Publish':
        return <MobilePublishView {...commonProps} />;
      case 'Decision':
        return <MobileDecisionView {...commonProps} />;
      case 'Answer':
        return (
          <MobileAnswerView
            {...commonProps}
            onOptionSelect={handleOptionSelect}
            selectedAnswers={selectedAnswers}
          />
        );
      case 'Success':
        return <MobileSuccessView {...commonProps} />;
      case 'Archived':
        return <MobileArchivedView {...commonProps} />;
      case 'Distribution':
        return <MobileDistributionView />;
      case 'Grants Admin':
        return <MobileGrantsAdminView />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3 pb-20">
      {/* Admin Panel Header */}
      <MobileAdminHeader
        currentView={currentView}
        onViewChange={handleViewChange}
        isSuperAdmin={isUserSuperAdmin}
      />

      {/* Admin Table */}
      <section className="relative z-10 rounded-xl border border-[rgba(59,39,223,0.2)] bg-[rgba(59,39,223,0.04)] p-3">
        <div className="mb-2 flex items-center justify-between">
          <Typography
            level="body2"
            className="font-baloo-2 text-base font-bold text-black"
          >
            {currentView}
          </Typography>
          <MobileAdminActions
            currentView={currentView}
            selectedQuests={selectedQuests}
            buttonStates={buttonStates}
            mutations={mutations}
            onHotClick={handleHotClick}
            onArchiveClick={handleArchiveClick}
            onUnarchiveClick={handleUnArchiveClick}
            onPublish={handlePublish}
            onReject={handleReject}
            onFinish={handleFinish}
            onSetDecision={handleSetDecision}
            onAdjourn={handleAdjourn}
            onSetAnswer={handleSetAnswer}
            onCancel={handleCancel}
            onSuccess={handleSuccess}
            onDistribute={handleDistribute}
          />
        </div>

        {renderCurrentView()}
      </section>

      {/* Distribute Dialog */}
      <MobileDistributeDialog
        open={showDistributeDialog}
        onOpenChange={setShowDistributeDialog}
      />
    </div>
  );
}

const AdminTableWithWrapper = withAdmin(MobileAdminTable);
export default AdminTableWithWrapper;
