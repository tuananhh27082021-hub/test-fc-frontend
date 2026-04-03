import { Typography } from '@/components/ui/typography';
import type { QuestDetail } from '@/types/schema';
import { formatNumber } from '@/utils/number';
import { getBettingToken } from '@/utils/quest';

import { Progress } from '../ui/progress';

export const VoteTab = ({ quest }: { quest: QuestDetail }) => {
  return (
    <div className="w-full space-y-4">
      {quest.answers.map((answer, index) => {
        const percent
          = quest.total_betting_amount > 0
            ? (answer.total_betting_amount * 100) / quest.total_betting_amount
            : 0;

        return (
          <VoteItem
            index={index + 1}
            key={answer.answer_key}
            option={answer.answer_title}
            amount={answer.total_betting_amount}
            percent={percent}
            quest={quest}
          />
        );
      })}
    </div>
  );
};

export const VoteItem = ({
  index,
  option,
  amount,
  percent,
  quest,
}: {
  index: number;
  option: string;
  amount: string | number;
  percent: string | number;
  quest: QuestDetail;
}) => {
  const bettingToken = getBettingToken(quest);
  const symbol = bettingToken.symbol;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-1">
        <Typography level="h5" className="font-medium">
          {index}
          .
          {option}
        </Typography>
        <div className="flex items-center gap-1">
          <Typography level="body2" className="text-foreground-50">
            {formatNumber(Number(percent), {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
            %
          </Typography>
          <Typography level="body2" className="text-foreground-50">
            (
            {formatNumber(Number(amount), {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
            {' '}
            {symbol}
            {' '}
            )
          </Typography>
        </div>
      </div>
      <Progress
        size="lg"
        bordered
        className="mt-1"
        variant="pink"
        value={Number(percent)}
      />
    </div>
  );
};

export const OpinionItem = ({
  index,
  option,
  percent,
}: {
  index: number;
  option: string;
  percent: string | number;
}) => {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-1">
        <Typography level="h5" className="font-medium">
          {index}
          .
          {option}
        </Typography>
        <div className="flex items-center gap-1">
          <Typography level="body2" className="text-foreground-50">
            {formatNumber(Number(percent), {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
            %
          </Typography>
        </div>
      </div>
      <Progress
        size="lg"
        bordered
        className="mt-1"
        variant="pink"
        value={Number(percent)}
      />
    </div>
  );
};
