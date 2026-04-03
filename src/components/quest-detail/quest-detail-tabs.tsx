import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { QuestDetail } from '@/types/schema';

import { HistoryTab } from './history-tab';
import { VoteTab } from './vote-tab';

export const QuestDetailTabs = ({ quest }: { quest: QuestDetail }) => {
  return (
    <div className="w-full">
      <Tabs defaultValue="voting">
        <TabsList>
          <TabsTrigger value="voting">Voting</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="voting">
          <VoteTab quest={quest} />
        </TabsContent>
        <TabsContent value="history">
          <HistoryTab quest={quest} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
