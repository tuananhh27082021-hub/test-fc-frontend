'use client';

interface MobileAdminActionsProps {
  currentView: string;
  selectedQuests: string | null;
  buttonStates: any;
  mutations: any;
  onHotClick: () => void;
  onArchiveClick: () => void;
  onUnarchiveClick: () => void;
  onPublish: () => void;
  onReject: () => void;
  onFinish: () => void;
  onSetDecision: () => void;
  onAdjourn: () => void;
  onSetAnswer: () => void;
  onCancel: () => void;
  onSuccess: () => void;
  onDistribute?: () => void;
}

export const MobileAdminActions = ({
  currentView,
  selectedQuests,
  buttonStates,
  mutations,
  onHotClick,
  onArchiveClick,
  onUnarchiveClick,
  onPublish,
  onReject,
  onFinish,
  onSetDecision,
  onAdjourn,
  onSetAnswer,
  onCancel,
  onSuccess,
  onDistribute,
}: MobileAdminActionsProps) => {
  if (currentView === 'In Progress') {
    return (
      <div className="flex flex-row gap-2">
        <button
          type="button"
          disabled={!selectedQuests || mutations.isHotSetting}
          onClick={onHotClick}
          className="flex h-5 w-9 items-center justify-center rounded-md bg-[rgba(59,39,223,0.2)] font-baloo-2 text-xs font-normal text-[#3B27DF] disabled:opacity-40"
        >
          {mutations.isHotSetting ? '...' : 'Hot'}
        </button>

        <button
          type="button"
          disabled={!selectedQuests || mutations.isArchiving}
          onClick={onArchiveClick}
          className="flex h-5 w-auto items-center justify-center rounded-md bg-[rgba(59,39,223,0.2)] px-2 font-baloo-2 text-xs font-normal text-[#3B27DF] disabled:opacity-40"
        >
          {mutations.isArchiving ? '...' : 'Archive'}
        </button>
      </div>
    );
  }

  if (currentView === 'Draft') {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPublish}
          className="rounded-md bg-[rgba(59,39,223,0.2)] px-1 py-0.5 font-baloo-2 text-xs font-normal text-[#3B27DF] disabled:opacity-40"
        >
          {buttonStates.isPublishing ? '...' : 'Publish'}
        </button>
        <button
          type="button"
          disabled={!selectedQuests || buttonStates.isCanceling}
          onClick={onReject}
          className="rounded-md bg-[rgba(59,39,223,0.2)] px-1 py-0.5 font-baloo-2 text-xs font-normal text-[#3B27DF] disabled:opacity-40"
        >
          {buttonStates.isCanceling ? '...' : 'Reject'}
        </button>
      </div>
    );
  }

  if (currentView === 'Publish') {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={
            !selectedQuests
            || buttonStates.isFinishing
            || !buttonStates.canFinish
          }
          onClick={onFinish}
          className="rounded-md bg-[rgba(59,39,223,0.2)] px-1 py-0.5 font-baloo-2 text-xs font-normal text-[#3B27DF] disabled:opacity-40"
        >
          {buttonStates.isFinishing ? '...' : 'Finish'}
        </button>
      </div>
    );
  }

  if (currentView === 'Decision') {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={
            !selectedQuests
            || buttonStates.isSettingDaoSuccess
            || !buttonStates.canSetDecision
          }
          onClick={onSetDecision}
          className="rounded-md bg-[rgba(59,39,223,0.2)] px-1 py-0.5 font-baloo-2 text-xs font-normal text-[#3B27DF] disabled:opacity-40"
        >
          {buttonStates.isSettingDaoSuccess ? '...' : 'Set Decision'}
        </button>
        <button
          type="button"
          disabled={
            !selectedQuests
            || buttonStates.isAdjourning
            || !buttonStates.canSetAdjourn
          }
          onClick={onAdjourn}
          className="rounded-md bg-[rgba(59,39,223,0.2)] px-1 py-0.5 font-baloo-2 text-xs font-normal text-[#3B27DF] disabled:opacity-40"
        >
          {buttonStates.isAdjourning ? '...' : 'Adjourn'}
        </button>
      </div>
    );
  }

  if (currentView === 'Answer') {
    return (
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={
            !selectedQuests
            || buttonStates.isSettingAnswer
            || !buttonStates.canSetAnswer
          }
          onClick={onSetAnswer}
          className="rounded-md bg-[rgba(59,39,223,0.2)] px-1 py-0.5 font-baloo-2 text-xs font-normal text-[#3B27DF] disabled:opacity-40"
        >
          {buttonStates.isSettingAnswer ? '...' : 'Set Answer'}
        </button>
        <button
          type="button"
          disabled={!selectedQuests || buttonStates.isAdjourning}
          onClick={onCancel}
          className="rounded-md bg-[rgba(59,39,223,0.2)] px-1 py-0.5 font-baloo-2 text-xs font-normal text-[#3B27DF] disabled:opacity-40"
        >
          {buttonStates.isAdjourning ? '...' : 'Cancel'}
        </button>
        <button
          type="button"
          disabled={
            !selectedQuests
            || buttonStates.isSettingSuccess
            || !buttonStates.canSetSuccess
          }
          onClick={onSuccess}
          className="rounded-md bg-[rgba(59,39,223,0.2)] px-1 py-0.5 font-baloo-2 text-xs font-normal text-[#3B27DF] disabled:opacity-40"
        >
          {buttonStates.isSettingSuccess ? '...' : 'Success'}
        </button>
      </div>
    );
  }

  if (currentView === 'Archived') {
    return (
      <button
        type="button"
        disabled={!selectedQuests || mutations.isUnarchiving}
        onClick={onUnarchiveClick}
        className="flex h-5 w-auto items-center justify-center rounded-md bg-[rgba(59,39,223,0.2)] px-2 font-baloo-2 text-xs font-normal text-[#3B27DF] disabled:opacity-40"
      >
        {mutations.isUnarchiving ? '...' : 'Unarchive'}
      </button>
    );
  }

  if (currentView === 'Distribution') {
    return (
      <button
        type="button"
        onClick={onDistribute}
        className="rounded-md bg-[rgba(59,39,223,0.2)] px-1 py-0.5 font-baloo-2 text-xs font-normal text-[#3B27DF] disabled:opacity-40"
      >
        Distribute
      </button>
    );
  }

  return null;
};
