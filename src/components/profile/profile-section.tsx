'use client';

import { useAccount } from 'wagmi';

import { useMediaQuery } from '@/hooks/use-media-query';

import { WalletOptionsDialog } from '../connect-wallet';
import { Button } from '../ui/button';
import { ProfileActivities } from './profile-activities';
import { ProfileInfo } from './profile-info';

export const ProfileSection = () => {
  const { address } = useAccount();
  const sm = useMediaQuery('(min-width: 640px)');

  if (!address) {
    return (
      <div className="app-container flex items-center justify-center rounded-t-14 bg-background py-16">
        <WalletOptionsDialog>
          <Button variant="outline" noShadow>
            Connect Wallet
          </Button>
        </WalletOptionsDialog>
      </div>
    );
  }

  return (
    <>
      <ProfileInfo />
      {sm && <ProfileActivities />}
    </>
  );
};
