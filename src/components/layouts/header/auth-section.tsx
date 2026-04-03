import { usePrivy } from '@privy-io/react-auth';
import React, { memo } from 'react';
import { useAccount } from 'wagmi';

import { Button } from '@/components/ui/button';

import { Account } from '../../connect-wallet';

export const AuthSection = memo(() => {
  const { authenticated, login } = usePrivy();
  const { isConnected } = useAccount();

  if (isConnected || authenticated) {
    return (
      <div className="flex items-center gap-4">
        <Account />
      </div>
    );
  }

  return (
    <Button variant="highlight" onClick={() => login()}>
      Login
    </Button>
  );
});

AuthSection.displayName = 'AuthSection';
