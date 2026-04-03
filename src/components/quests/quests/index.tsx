'use client';

import { QuestsMobile } from '@/components/ui/quest-card/quests-mobile';
import { useIsMobile } from '@/hooks/use-is-mobile';

import { QuestHeader } from './quest-header';
import { QuestList } from './quest-list';

export const AllQuests = () => {
  const isMobile = useIsMobile();
  return isMobile
    ? (
        <QuestsMobile status={['PUBLISH', 'DAO_SUCCESS', 'FINISH']} />
      )
    : (
        <>
          <QuestHeader />
          <QuestList />
        </>
      );
};
