import dayjs from 'dayjs';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Typography } from '@/components/ui/typography';
import type { Quest } from '@/types/schema';
import { formatNumber } from '@/utils/number';

import { Skeleton } from './ui/skeleton';

type QuestCardProps = {
  name: string;
  image?: string;
  status: 'in-progress' | 'ended';
  endAt: string | Date;
  answers: Quest['answers'];
  total: number;
  symbol: string;
  isOpinionBounty?: boolean;
  isLive?: boolean;
};

export default function QuestCard({
  name,
  image,
  status,
  endAt,
  answers,
  total,
  symbol,
  isOpinionBounty,
  isLive,
}: QuestCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="relative aspect-4/3 overflow-hidden rounded-[40px_40px_24px_40px]">
          <Image
            alt={name}
            width={0}
            height={0}
            sizes="100vw"
            src={image ?? ''}
            className="size-full object-cover"
          />
          {isLive && (
            <div className="absolute left-2 top-2 z-[2] flex items-center gap-2 rounded-full bg-red-500 px-3 py-1">
              <div className="size-2 animate-pulse rounded-full bg-white"></div>
              <span className="text-sm font-medium text-white">LIVE</span>
            </div>
          )}
          <div className="absolute bottom-2 right-2 z-[1] rounded-2xl bg-white/80 px-4 py-2">
            <p className="text-xl text-foreground-50 backdrop-blur-lg">
              Total:
              {' '}
              <span className="font-semibold text-secondary">
                {formatNumber(total, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 4,
                })}
                {' '}
                {symbol}
              </span>
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Typography level="h5" className="mb-2 line-clamp-2">
          {name}
        </Typography>
        <div className="mb-6 flex items-center gap-3">
          <Badge variant={status === 'in-progress' ? 'outline' : 'filled'}>
            {status === 'in-progress' && 'In Progress'}
            {status === 'ended' && 'Close'}
          </Badge>
          <Typography level="body1">
            {dayjs(endAt).format('YYYY/MM/DD - hh:mm:ss')}
          </Typography>
        </div>
        <div className="rounded-3xl bg-black/5 px-[18px] py-3">
          <Typography level="h6" className="mb-2">
            Answer:
          </Typography>
          <div className="flex flex-col gap-3">
            {answers.map((answer) => {
              const percent
                = total === 0 ? 0 : (answer.total_betting_amount * 100) / total;
              return (
                <div key={answer.answer_key}>
                  <div className="mb-1 flex items-center justify-between gap-1">
                    <Typography level="body2" className="text-foreground-50">
                      {answer.answer_title}
                    </Typography>
                    {!isOpinionBounty && (
                      <div className="flex items-center gap-1">
                        <Typography
                          level="body2"
                          className="text-foreground-50"
                        >
                          {formatNumber(percent, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })}
                          %
                        </Typography>
                        <Typography
                          level="body2"
                          className="text-foreground-50"
                        >
                          (
                          {formatNumber(answer.total_betting_amount, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })}
                          {` `}
                          {symbol}
                          )
                        </Typography>
                      </div>
                    )}
                  </div>
                  <Progress
                    size="md"
                    bordered
                    className="mt-1"
                    variant="pink"
                    value={percent}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const QuestCardSkeketon = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="aspect-video w-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-2 h-5 w-1/2" />
        <Skeleton className="mb-6 h-8 w-2/3" />
        <Skeleton className="h-32 w-full" />
      </CardContent>
    </Card>
  );
};
