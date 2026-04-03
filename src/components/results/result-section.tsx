'use client';

import { ResultList } from '@/components/results/result-list';
import { CustomBreadcrumb } from '@/components/ui/breadcrumb';
import { QuestsMobile } from '@/components/ui/quest-card/quests-mobile';
import { Typography } from '@/components/ui/typography';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { HomeSolidIcon } from '@/icons/icons';

const breadcrumbItems = [
  { label: 'Homepage', href: '/', icon: <HomeSolidIcon /> },
];

export function ResultSection() {
  const isMobile = useIsMobile();
  const breadcrumb = (
    <CustomBreadcrumb items={breadcrumbItems} currentPage="Results" />
  );

  return !isMobile
    ? (
        <div className="relative">
          <div className="border-b border-border bg-white px-6 py-3">
            {breadcrumb}
          </div>

          <div
            className="bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/assets/images/dao-bg.png)',
            }}
          >
            <div className="px-4 pb-[150px] pt-6 md:px-6 md:pb-[190px] lg:px-10 lg:pb-[216px] xl:px-12 xl:pb-[257px]">
              <Typography
                asChild
                level="h3"
                className="mt-10 text-center font-clash-display font-semibold text-white md:mt-6 lg:text-[40px]"
              >
                <h2>Results</h2>
              </Typography>
            </div>
          </div>

          <ResultList />
        </div>
      )
    : (
        <div className="min-h-[calc(100vh-110px)]">
          <QuestsMobile status={['MARKET_SUCCESS']} highlightAnswer />
        </div>
      );
}
