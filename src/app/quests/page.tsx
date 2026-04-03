'use client';

import { FearturedQuests } from '@/components/quests/featured';
import { AllQuests } from '@/components/quests/quests';
import { useIsMobile } from '@/hooks/use-is-mobile';

export default function QuestsPage() {
  const isMobile = useIsMobile();
  return (
    <main className={!isMobile ? 'app-container' : 'min-h-[calc(100vh-110px)]'}>
      {!isMobile && <FearturedQuests />}
      <AllQuests />
    </main>
  );
}
