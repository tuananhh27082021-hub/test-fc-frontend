'use client';

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
  const { address } = useAccount();
  const [mounted, setMounted] = useState(false);
  const { referralCode } = useReferral();
  const { data, refetch } = useGetMember(address, referralCode);
  const { balance: nftBalance } = useNFTBalance();

  const user = data?.data;

  useEffect(() => {
    setMounted(true);
  }, []);

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
