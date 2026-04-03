'use client';

import { usePrivy } from '@privy-io/react-auth';
import { CheckIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { Typography } from '@/components/ui/typography';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

import { Button } from '../ui/button';
import CopyIcon from '../ui/copy-icon';

export const MobileAccountHeader = () => {
  const { address } = useAccount();
  const [copiedText, copy, setCopiedText] = useCopyToClipboard();

  const { ready, authenticated, user, exportWallet } = usePrivy();
  const isAuthenticated = ready && authenticated;
  const [hasEmbeddedWallet, setHasEmbeddedWallet] = useState(false);

  useEffect(() => {
    if (user) {
      setHasEmbeddedWallet(
        !!user.linkedAccounts.find(
          account =>
            account.type === 'wallet'
            && account.walletClientType === 'privy'
            && account.chainType === 'ethereum',
        ),
      );
    }
  }, [user]);

  const handleCopyAddress = () => {
    if (address) {
      copy(address).then(() =>
        setTimeout(() => {
          setCopiedText('');
        }, 1000),
      );
    }
  };

  return (
    <div className="mt-6 flex items-center gap-2">
      <Typography level="h4" className="font-baloo-2 text-base font-bold">
        My Account
      </Typography>
      <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2">
        <Typography
          level="body2"
          className="font-baloo-2 text-sm font-medium text-[#3B27DF]"
        >
          {address?.toString().slice(0, 8)}
          ...
          {address?.toString().slice(-4)}
        </Typography>
        <button type="button" onClick={handleCopyAddress} className="size-3">
          {copiedText
            ? (
                <CheckIcon className="size-3 text-[#3B27DF]" />
              )
            : (
                <CopyIcon size={12} color="#3B27DF" />
              )}
        </button>
      </div>
      {isAuthenticated && hasEmbeddedWallet && (
        <Button
          onClick={exportWallet}
          variant="outline"
          noShadow
          startDecoratorClassName="inline-flex items-center justify-center w-2 h-2"
          className="mb-2 h-6 w-[100px] border-[#3B27DF] text-xs font-semibold leading-none text-[#3B27DF]"
        >
          Export Wallet
        </Button>
      )}
    </div>
  );
};
