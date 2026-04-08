'use client';

import { usePrivy } from '@privy-io/react-auth';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import type { Connector } from 'wagmi';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

import { useAuth } from '@/app/auth-provider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ROUTES } from '@/config/routes';
import { connectorIdToIconMap } from '@/config/wagmi';
import { useMediaQuery } from '@/hooks/use-media-query';
import { LogoutIcon, UserIcon } from '@/icons/icons';
import { cn } from '@/utils/cn';
import { isAdmin } from '@/utils/member';
import { maskWalletAddress } from '@/utils/wallet';

import { Button, buttonVariants } from './ui/button';

export function WalletOptions() {
  const { connectors, connect } = useConnect();

  return connectors.map(connector => (
    <WalletOption
      key={connector.uid}
      connector={connector}
      onClick={() => connect({ connector })}
    />
  ));
}

export function Account() {
  const { address } = useAccount();
  const { user } = useAuth();
  const { disconnect } = useDisconnect();
  const { logout } = usePrivy();
  const sm = useMediaQuery('(min-width: 640px)');

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      // Logout from Privy first
      await logout();

      // Then disconnect from WAGMI
      disconnect();

      // Clear service worker cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName)),
        );
      }

      // Clear localStorage
      localStorage.clear();

      // Clear sessionStorage
      sessionStorage.clear();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!address) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      {sm
        ? (
            <>
              {address && !isAdmin(user) && (
                <Link href={ROUTES.PROFILE}>
                  <Button variant="highlight">{maskWalletAddress(address)}</Button>
                </Link>
              )}
              {isAdmin(user) && address && (
                <div className="flex flex-row gap-3">
                  <Link href={ROUTES.PROFILE}>
                    <Button variant="highlight">
                      {maskWalletAddress(address)}
                    </Button>
                  </Link>
                  <Link href={ROUTES.ADMIN_PLAY_GAME}>
                    <Button variant="highlight">Admin</Button>
                  </Link>
                </div>
              )}
            </>
          )
        : (
            <Link href={ROUTES.PROFILE}>
              <Button size="icon" variant="highlight">
                <UserIcon className="size-6" />
              </Button>
            </Link>
          )}
      <Button onClick={handleLogout} size="icon" variant="highlight">
        <LogoutIcon className="size-6" />
      </Button>
    </div>
  );
}

type WalletOptionsDialogProps = React.PropsWithChildren<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}>;

export function WalletOptionsDialog({
  children,
  open,
  onOpenChange,
}: WalletOptionsDialogProps) {
  const { connectors, connect } = useConnect();
  const { connectWallet, authenticated } = usePrivy();

  const handlePrivyLogin = async () => {
    try {
      // Allow detected wallets on both desktop and mobile. 
      // On mobile, our Kaia polyfill will show up under 'detected_ethereum_wallets'.
      await connectWallet({
        walletList: ['detected_ethereum_wallets', 'wallet_connect'],
      });

      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Privy login error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Select the wallet that you want to log in
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-4">
          {!authenticated && (
            <button
              className={cn(
                buttonVariants({
                  variant: 'outline',
                  className: 'w-full gap-3',
                }),
              )}
              type="button"
              onClick={handlePrivyLogin}
            >
              <div>
                <Image
                  src="/assets/icons/privy-logo.png"
                  alt="Privy Logo"
                  width={28}
                  height={28}
                  className="size-[28px] object-cover"
                />
              </div>
              Login with Privy
            </button>
          )}
          {connectors
            .filter(c => c.id !== 'io.metamask')
            .map(connector => (
              <WalletOption
                key={connector.uid}
                connector={connector}
                onClick={() => connect({ connector })}
              />
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WalletOption({
  connector,
  onClick,
}: {
  connector: Connector;
  onClick: () => void;
}) {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const provider = await connector.getProvider();
      setReady(!!provider);
    })();
  }, [connector]);

  // @ts-expect-error ignore
  const iconUrl = connectorIdToIconMap[connector.id] || connector.icon;

  return (
    <button
      className={cn(
        buttonVariants({ variant: 'outline', className: 'w-full gap-3' }),
      )}
      disabled={!ready}
      onClick={onClick}
      type="button"
    >
      <img
        src={iconUrl}
        alt={connector.name}
        className="size-[28px] object-cover"
      />
      {connector.name}
    </button>
  );
}
