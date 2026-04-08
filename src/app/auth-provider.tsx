'use client';

import { usePrivy } from '@privy-io/react-auth';
import type { FC, ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { useNFTBalance } from '@/hooks/use-contract';
import { useGetMember } from '@/hooks/use-member';
import type { User } from '@/types/schema';
import { useReferral } from '@/hooks/use-referral';

type AuthContextType = {
  user?: User;
  nftBalance: number;
  reloadUser: VoidFunction;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const { authenticated, connectWallet } = usePrivy();
  const { address, isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const { referralCode } = useReferral();
  const { data, refetch } = useGetMember(address, referralCode);
  const { balance: nftBalance } = useNFTBalance();

  const user = data?.data;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('connect') === 'true' && !isConnected && !authenticated) {
      // Small delay to ensure the native provider is injected (Kaia Wallet takes a moment)
      const timer = setTimeout(() => {
        const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
        connectWallet({
          walletList: isMobile
            ? ['wallet_connect']
            : ['detected_ethereum_wallets', 'wallet_connect'],
        });

        // Cleanup the URL
        const newUrl = window.location.pathname + window.location.search.replace(/[?&]connect=true/, '').replace(/^&/, '?');
        window.history.replaceState({}, '', newUrl);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [mounted, isConnected, authenticated, connectWallet]);

  if (!mounted) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        nftBalance,
        reloadUser: refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
