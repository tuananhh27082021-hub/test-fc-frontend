'use client';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Typography } from '@/components/ui/typography';
import type {
  DAOQuestAnswer,
  DAOQuestDraft,
  DAOQuestSuccess,
} from '@/types/schema';

type QuestTabProps =
  | { status: 'draft'; quest: DAOQuestDraft }
  | { status: 'success'; quest: DAOQuestSuccess }
  | { status: 'answer'; quest: DAOQuestAnswer };

export const QuestTab = ({ status, quest }: QuestTabProps) => {
  const answers = quest.answers;

  return (
    <ScrollArea className="h-[126px]">
      {answers.map((answer, index) => (
        <div className="mb-2" key={answer.answer_key}>
          <div className="flex items-center justify-between">
            <Typography
              level="body2"
              className="font-medium text-foreground-70"
            >
              {index + 1}
              .
              {answer.answer_title}
            </Typography>

            {(status === 'success' || status === 'answer') && (
              <div className="flex items-center gap-1">
                <Typography
                  level="body2"
                  className="font-medium text-foreground-70"
                >
                  0
                </Typography>
                <Badge>0%</Badge>
              </div>
            )}
          </div>
          <Progress className="mt-1" value={status === 'draft' ? 0 : 100} />
        </div>
      ))}
    </ScrollArea>
  );
};
