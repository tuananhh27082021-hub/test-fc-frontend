'use client';

// import { ResultDetailContainer } from "@/components/results/result-detail";
import { CustomBreadcrumb } from '@/components/ui/breadcrumb';
import { Typography } from '@/components/ui/typography';
import { useMediaQuery } from '@/hooks/use-media-query';
import { HomeSolidIcon } from '@/icons/icons';

import { ResultDetail } from './result-detail';

const breadcrumbItems = [
  { label: 'Homepage', href: '/', icon: <HomeSolidIcon /> },
];

export function ResultDetailSection() {
  const sm = useMediaQuery('(min-width: 640px)');

  const breadcrumb = (
    <CustomBreadcrumb items={breadcrumbItems} currentPage="Results" />
  );

  return (
    <>
      {/* {!sm && (
        <div className="border-b border-border bg-white px-6 py-3">
          {breadcrumb}
        </div>
      )} */}

      <div
        className="bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/assets/images/dao-bg.png)',
        }}
      >
        <div className="px-4 pb-[150px] pt-6 md:px-6 md:pb-[190px] lg:px-10 lg:pb-[216px] xl:px-12 xl:pb-[257px]">
          {!!sm && (
            <div className="mb-6 inline-block rounded-2xl border border-border bg-white px-6 py-3.5">
              {breadcrumb}
            </div>
          )}

          <Typography
            asChild
            level="h3"
            className="mt-10 text-center font-clash-display font-semibold text-white md:mt-6 lg:text-[40px]"
          >
            <h2>Results</h2>
          </Typography>
        </div>
      </div>

      <ResultDetail />
    </>
  );
}
