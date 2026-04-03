import { usePrivy } from '@privy-io/react-auth';
import { LogOut, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DOCS_URL } from '@/config/constants';
import { ROUTES } from '@/config/routes';

const MenuItem = memo(
  ({
    href,
    onClick,
    children,
  }: {
    href?: string;
    onClick?: () => void;
    children: React.ReactNode;
  }) => {
    if (href) {
      return (
        <Link
          href={href}
          onClick={onClick}
          prefetch={false}
          className="block w-full"
        >
          <button
            type="button"
            className="h-[40px] w-full text-left font-baloo-2 text-[12px] font-medium"
          >
            {children}
          </button>
        </Link>
      );
    }

    return (
      <button
        type="button"
        className="h-[40px] w-full text-left font-baloo-2 text-[12px] font-medium"
        onClick={onClick}
      >
        {children}
      </button>
    );
  },
);

MenuItem.displayName = 'MenuItem';

const Divider = memo(() => (
  <div className="flex w-full flex-col items-start border-b" />
));

Divider.displayName = 'Divider';

const SocialLink = memo(({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    className="flex h-[40px] w-full items-center gap-2 font-baloo-2 text-[12px] font-medium"
    onClick={() => {
      onClick();
      window.open(DOCS_URL, '_blank', 'noopener,noreferrer');
    }}
  >
    <Image src="/assets/icons/X.png" alt="X Logo" width={12} height={12} />
    <div className="h-[20px] w-px bg-black" />
    Documents
  </button>
),
);

SocialLink.displayName = 'SocialLink';

export const MobileNav = memo(({ connected }: { connected: boolean }) => {
  const [open, setOpen] = useState(false);
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { login, logout } = usePrivy();

  const handleLinkClick = useCallback(() => {
    setOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      disconnect();

      // Clear caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName)),
        );
      }

      localStorage.clear();
      sessionStorage.clear();

      setOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout, disconnect]);

  useEffect(() => {
    if (isConnected && isWalletDialogOpen) {
      setIsWalletDialogOpen(false);
    }
  }, [isConnected, isWalletDialogOpen]);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="ghost"
            className="border-0 shadow-none lg:hidden"
            noShadow
          >
            {connected
              ? (
                  <Image
                    src="/assets/images/account-connected.png"
                    alt="account logo"
                    width={32}
                    height={32}
                  />
                )
              : (
                  <Menu className="size-6" />
                )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="flex w-[140px] flex-col items-start border-none px-3 py-0 font-baloo-2 font-medium shadow-2xl"
          align="end"
        >
          {!isConnected
            ? (
                <MenuItem onClick={() => login()}>Login</MenuItem>
              )
            : (
                <MenuItem href={ROUTES.PROFILE} onClick={handleLinkClick}>
                  My Profile
                </MenuItem>
              )}

          <Divider />
          <MenuItem href={ROUTES.HOME} onClick={handleLinkClick}>
            Trending
          </MenuItem>
          <MenuItem href={ROUTES.QUESTS} onClick={handleLinkClick}>
            Quest
          </MenuItem>
          <MenuItem href={ROUTES.RESULTS} onClick={handleLinkClick}>
            Result
          </MenuItem>

          <Divider />

          {isConnected && (
            <button
              type="button"
              className="flex h-[40px] w-full items-center gap-1.5 border-b font-baloo-2 text-[12px] font-medium text-[#EB2E2E]"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
            >
              <LogOut className="size-3" />
              Log Out
            </button>
          )}

          <SocialLink onClick={handleLinkClick} />
        </PopoverContent>
      </Popover>
      <Button variant="highlight" noShadow className="hidden">
        Login
      </Button>
    </>
  );
});

MobileNav.displayName = 'MobileNav';
