import { useOpinionBounty } from '@/hooks/use-opinion-bounty';
import { useQuestStatus } from '@/hooks/use-quest-status';
import type { QuestDetail } from '@/types/schema';

import { LiveStream } from './livestream';
import { MobileActivity } from './mobile/activity';
import { MobileContextCard } from './mobile/context-card';
import { MobileHeaderStats } from './mobile/header-stats';
import { MobileIntroCard } from './mobile/intro-card';
import { MobileOutcomes } from './mobile/outcomes';
import { MobilePredictSection } from './mobile/predict-section';
import { MobileVoteSection } from './mobile/vote-section';
import { YouTubeEmbed } from './youtube-embed';

export const QuestDetailMobile = ({ quest }: { quest: QuestDetail }) => {
  const isOpinionBounty = useOpinionBounty(quest);
  const { status } = useQuestStatus(quest);

  return (
    <div className="h-screen overflow-y-auto p-4">
      <LiveStream quest={quest} />
      {quest?.youtube_url && (
        <div className="mt-6">
          <YouTubeEmbed url={quest.youtube_url} />
        </div>
      )}
      <div className="h-6" />
      <MobileIntroCard quest={quest} />
      <div className="h-4" />
      <MobileHeaderStats quest={quest} />
      <MobileContextCard quest={quest} />
      {isOpinionBounty
        ? (
            <>
              {status !== 'ended' && <MobileVoteSection quest={quest} />}
              <MobileOutcomes quest={quest} />
            </>
          )
        : (
            <>
              {status !== 'ended' && <MobilePredictSection quest={quest} />}
              <MobileOutcomes quest={quest} />
              <MobileActivity quest={quest} />
            </>
          )}
    </div>
  );
};

export default QuestDetailMobile;
