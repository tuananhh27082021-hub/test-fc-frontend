import dayjs from 'dayjs';

import type { Quest, QuestDetail } from '@/types/schema';

export const useQuestStatus = (quest: Quest | QuestDetail) => {
  const status = (() => {
    const expireFinishDate
      = !!quest.quest_finish_datetime
      && dayjs(quest.quest_finish_datetime).isBefore(dayjs());

    const expireEndDate
      = quest.quest_end_date && dayjs(quest.quest_end_date).isBefore(dayjs());

    return expireFinishDate || expireEndDate ? 'ended' : 'in-progress';
  })();

  return { status };
};
