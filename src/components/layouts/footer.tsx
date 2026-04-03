'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Typography } from '@/components/ui/typography';
import { DOCS_URL } from '@/config/constants';
import { useMediaQuery } from '@/hooks/use-media-query';
import { TwitterIcon } from '@/icons/icons';

export const Footer = () => {
  const sm = useMediaQuery('(min-width: 640px)');

  if (!sm) {
    return null;
  }

  return (
    <footer>
      <div className="hidden min-h-[88px] w-full px-6 pt-10 md:block lg:px-10 xl:px-12 2xl:px-[60px]">
        <div className="mb-6 flex flex-col gap-8 lg:flex-row lg:justify-between">
          <div className="relative lg:w-full">
            <Image src="/logo.png" alt="Forecast" width={196} height={48} />
          </div>
          <div className="flex w-full flex-wrap justify-between gap-4">
            <div className="flex flex-col gap-3">
              <Typography level="h5" className="font-medium">
                Information
              </Typography>
              <Typography><Link href={DOCS_URL} target="_blank" rel="noopener noreferrer">Documents</Link></Typography>
            </div>
            <div className="flex flex-col gap-3">
              <Typography level="h5" className="font-medium">
                Contact
              </Typography>
              <a href="mailto:info@forecast.vote">
                <Typography>info@forecast.vote</Typography>
              </a>
            </div>
            <div className="flex shrink-0 flex-col gap-3 ">
              <Typography level="h5" className="font-medium">
                Social Platform
              </Typography>
              <div className="flex items-center gap-4">
                <a
                  href="https://x.com/forecast_kaia"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <TwitterIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between bg-[#3B27DF] py-3">
        <p className="mx-auto text-[12px] text-white sm:text-lg">
          Copyright ©
          <span className="text-[12px] font-semibold uppercase text-white sm:text-lg">
            Forecast Company
            {' '}
          </span>
          Co., LTD. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};
