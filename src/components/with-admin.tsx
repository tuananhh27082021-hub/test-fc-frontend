'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';

import { useAuth } from '@/app/auth-provider';
import { storageKey } from '@/config/query';
import { ROUTES } from '@/config/routes';
import { useSessionStorage } from '@/hooks/use-storage';
import type { AuthHeaderRequest } from '@/types/schema';
import { isAdmin } from '@/utils/member';

interface WithAdminProps {}

export function withAdmin<T extends WithAdminProps = WithAdminProps>(
  WrappedComponent: React.ComponentType<T>,
) {
  const displayName
    = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ComponentWithTheme = (props: Omit<T, keyof WithAdminProps>) => {
    const { address } = useAccount();
    const { user } = useAuth();
    const { signMessageAsync } = useSignMessage();
    const router = useRouter();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    const [storedValue, setValue] = useSessionStorage<AuthHeaderRequest | null>(
      storageKey.signedMessage,
      null,
    );

    useEffect(() => {
      if (!storedValue && address) {
        const message = String(Date.now());
        signMessageAsync({ message }).then((signature) => {
          setValue({ message, signature });
        });
      }
    }, [storedValue, address, setValue]);

    // FIXME
    if (!mounted) {
      return null;
    }

    if (!user) {
      return null;
    }

    if (!isAdmin(user)) {
      router.replace(ROUTES.HOME);
      return null;
    }

    if (!storedValue?.message) {
      return null;
    }

    return <WrappedComponent {...(props as T)} />;
  };

  ComponentWithTheme.displayName = `withAdmin(${displayName})`;

  return ComponentWithTheme;
}
