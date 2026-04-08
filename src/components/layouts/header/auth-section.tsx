import { usePrivy } from '@privy-io/react-auth';
import React, { memo } from 'react';
import { useAccount } from 'wagmi';

import { Button } from '@/components/ui/button';

import { Account } from '../../connect-wallet';

export const AuthSection = memo(() => {
  const { authenticated, connectWallet } = usePrivy();
  const { isConnected } = useAccount();

  const handleLogin = async () => {
    await connectWallet({
      walletList: ['detected_ethereum_wallets', 'wallet_connect'],
    });
  };

  if (isConnected || authenticated) {
    return (
      <div className="flex items-center gap-4">
        <Account />
      </div>
    );
  }

  return (
    <Button variant="highlight" onClick={handleLogin}>
      Login
    </Button>
  );
});

AuthSection.displayName = 'AuthSection';
