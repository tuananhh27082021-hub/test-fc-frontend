'use client';

import { AboutUs } from '@/components/landing/about-us';
import { Hero } from '@/components/landing/hero';
import { PopularVote } from '@/components/landing/popular-vote';
import { Services } from '@/components/landing/services';
import { Trending } from '@/components/landing/trending';
import { WhatIsBoomPlay } from '@/components/landing/what-is-boom-play';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useReferral } from '@/hooks/use-referral';

export default function Index() {
  useReferral();
  const isMobile = useIsMobile();

  return (
    <>
      <Hero />
      {isMobile
        ? (
            <>
              <Trending />
              <InstallPrompt />
            </>
          )
        : (
            <>
              <PopularVote />
              <AboutUs />
              <Services />
              <WhatIsBoomPlay />
            </>
          )}
    </>
  );
}
