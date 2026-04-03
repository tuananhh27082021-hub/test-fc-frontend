'use client';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Typography } from '@/components/ui/typography';
import { useFilterAdminQuests } from '@/hooks/use-dao-quests';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/utils/cn';

import { withAdmin } from '../with-admin';
import { AdminTable } from './data-table';
import { MobileAdminTable } from './mobile-admin-table';

export type GameType = {
  no: string;
  category: string;
  title: string;
  questEndDate: string;
  questStatus: string;
  answerPending: string;
  questPending: string;
};

const questStatusOptions = [
  { name: 'ALL', value: 'ongoing' },
  { name: 'DRAFT', value: 'draft' },
  { name: 'PUBLISH', value: 'publish' },
  // { name: 'DECISION', value: 'decision' },
  { name: 'ANSWER', value: 'answer' },
  { name: 'SUCCESS', value: 'success' },
  // { name: 'ADJOURN', value: 'adjourn' },
  { name: 'ARCHIVED', value: 'archived' },
];

function AdminWrapperContent() {
  const { status, setStatus } = useFilterAdminQuests();
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return <MobileAdminTable status={status} />;
  }

  return (
    <div className="overflow-hidden rounded-8 bg-background px-12 shadow-light">
      <div className="flex py-10">
        <div className="flex items-center gap-6">
          <Typography level="h4">FORECAST VOTES:</Typography>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <ToggleGroup
            value={status}
            onValueChange={val => setStatus(val as any)}
            type="single"
            className="gap-4"
          >
            {questStatusOptions.map(option => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                variant="outline"
                className={cn(
                  'rounded-lg px-4',
                  status === option.value && 'pointer-events-none',
                )}
              >
                {option.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <AdminTable status={status} />
    </div>
  );
}

export default withAdmin(AdminWrapperContent);
