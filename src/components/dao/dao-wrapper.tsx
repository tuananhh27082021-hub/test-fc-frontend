'use client';

import { useAccount } from 'wagmi';

import { useAuth } from '@/app/auth-provider';
import { DAOContainer } from '@/components/dao/dao-container';
import { CustomBreadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { useMediaQuery } from '@/hooks/use-media-query';
import { HomeSolidIcon } from '@/icons/icons';

import { WalletOptionsDialog } from '../connect-wallet';
import { Delegate } from './delegate';

const breadcrumbItems = [
  { label: 'Homepage', href: '/', icon: <HomeSolidIcon /> },
];

export function DAOWrapper() {
  const { user } = useAuth();
  const { address } = useAccount();
  const sm = useMediaQuery('(min-width: 768px)');

  if (!address) {
    return (
      <div className="app-container flex items-center justify-center rounded-t-14 bg-background py-16">
        <WalletOptionsDialog>
          <Button variant="outline">Connect Wallet</Button>
        </WalletOptionsDialog>
      </div>
    );
  }

  const breadcrumb = (
    <CustomBreadcrumb items={breadcrumbItems} currentPage="Dao" />
  );

  return (
    <>
      {!sm && (
        <div className="border-b border-border bg-white px-6 py-3">
          {breadcrumb}
        </div>
      )}
      <div
        className="bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/assets/images/dao-bg.png)',
        }}
      >
        <div className="h-[256px] p-6 md:h-[320px] lg:px-10 xl:h-[400px] xl:px-12 2xl:px-16">
          {!!sm && (
            <div className="mb-6 inline-block rounded-2xl border border-border bg-white px-6 py-3.5">
              {breadcrumb}
            </div>
          )}

          <div className="mt-12 flex items-center justify-center md:mt-6">
            <Typography
              level="h2"
              className="font-clash-display font-semibold text-white"
            >
              DAO
            </Typography>
          </div>
        </div>
      </div>

      {user && user.delegatedTx ? <DAOContainer /> : <Delegate />}
    </>
  );
}
