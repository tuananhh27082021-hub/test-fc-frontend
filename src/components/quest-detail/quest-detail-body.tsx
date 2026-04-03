import { useMediaQuery } from '@/hooks/use-media-query';
import type { QuestDetail } from '@/types/schema';

import { QuestCard } from './quest-card';
import QuestDetailMobile from './quest-detail-mobile';
import { QuestDetailTabs } from './quest-detail-tabs';
import { QuestInfo } from './quest-info';
import { VoteForm } from './vote-form';

export const QuestDetailBody = ({ quest }: { quest: QuestDetail }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  if (isMobile) {
    return <QuestDetailMobile quest={quest} />;
  }
  return (
    <div className="app-container px-6 py-8 md:px-8 lg:px-0">
      <div className="mb-9 flex flex-col gap-5 border-b border-dashed border-border pb-8 lg:flex-row lg:gap-20">
        <div className="lg:order-2">
          <QuestCard quest={quest} />
        </div>
        <div className="space-y-5 lg:order-1 lg:flex-1 lg:space-y-10">
          <QuestInfo quest={quest} />
          <VoteForm quest={quest} />
        </div>
      </div>

      <QuestDetailTabs quest={quest} />
    </div>
  );
};
