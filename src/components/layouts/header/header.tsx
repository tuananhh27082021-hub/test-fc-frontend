'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAccount, useSwitchChain } from 'wagmi';

import { ROUTES } from '@/config/routes';
import { useIsMobile } from '@/hooks/use-is-mobile';

import { AuthSection } from './auth-section';
import { DESKTOP_NAV_ITEMS } from './constants';
import { DesktopNav } from './desktop-nav';
import { MobileNav } from './mobile-nav';

export const Header = () => {
  const segment = useSelectedLayoutSegment();
  const { isConnected } = useAccount();
  const { chains, switchChain } = useSwitchChain();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isConnected && chains.length > 0) {
      switchChain({ chainId: chains[0].id });
    }
  }, [isConnected, chains, switchChain]);

  return (
    <header className="border-border/30 min-h-[65px] w-full border-b p-4 sm:min-h-[88px] sm:px-6 sm:py-5 lg:px-10 xl:px-12 2xl:px-[60px]">
      <div className="flex w-full items-center justify-between">
        <Link href={ROUTES.HOME} className="shrink-0">
          <Image
            src="/logo.png"
            alt="Forecast"
            width={isMobile ? 112 : 196}
            height={isMobile ? 30 : 48}
            priority
          />
        </Link>

        {!isMobile && (
          <DesktopNav items={DESKTOP_NAV_ITEMS} segment={segment} />
        )}

        {!isMobile && <AuthSection />}

        {isMobile && <MobileNav connected={isConnected} />}
      </div>

      {/* {isMobile && (
        <BottomNav segment={segment} />
      )} */}
    </header>
  );
};
