'use client';

import { useCallback, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';

import type { AuthHeaderRequest } from '@/types/schema';

interface AuthState {
  authHeaders: AuthHeaderRequest | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Kiểm tra auth data trong localStorage
    const savedAuthData = localStorage.getItem('authData');
    const savedAddress = localStorage.getItem('authAddress');

    let authHeaders: AuthHeaderRequest | null = null;

    if (savedAuthData && savedAddress === address) {
      try {
        const parsed = JSON.parse(savedAuthData);
        authHeaders = {
          message: parsed.message,
          signature: parsed.signature,
        };
      } catch (error) {
        console.error('Invalid saved auth data:', error);
      }
    }

    return {
      authHeaders,
      isAuthenticated: !!(authHeaders && savedAddress === address),
      isLoading: false,
      error: null,
    };
  });

  const authenticate = useCallback(async (): Promise<AuthHeaderRequest | null> => {
    if (!address) {
      setAuthState(prev => ({ ...prev, error: 'Wallet not connected' }));
      return null;
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Tạo message format đơn giản tương thích với web3.eth.accounts.recover
      // Sử dụng timestamp như trong with-admin.tsx để tránh vấn đề HTTP headers
      const timestamp = Date.now();
      const message = String(timestamp);

      // Sign message - wagmi sẽ tự động thêm prefix "\x19Ethereum Signed Message:\n"
      const signature = await signMessageAsync({ message });

      // Tạo AuthHeaderRequest object
      const authHeaders: AuthHeaderRequest = {
        message,
        signature,
      };

      // Lưu auth info để sử dụng cho API calls (bao gồm address để verify)
      const authData = {
        message,
        signature,
        address,
        timestamp,
      };

      localStorage.setItem('authData', JSON.stringify(authData));
      localStorage.setItem('authAddress', address);

      // Verify locally trước khi gửi (optional, để debug)
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth data created:', {
          address,
          messageLength: message.length,
          signatureLength: signature.length,
          timestamp,
        });
      }

      setAuthState({
        authHeaders,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return authHeaders;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setAuthState({
        authHeaders: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      return null;
    }
  }, [address, signMessageAsync]);

  const logout = useCallback(() => {
    localStorage.removeItem('authData');
    localStorage.removeItem('authAddress');
    setAuthState({
      authHeaders: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const getAuthHeaders = useCallback(async (): Promise<AuthHeaderRequest | null> => {
    if (authState.isAuthenticated && authState.authHeaders) {
      return authState.authHeaders;
    }

    return await authenticate();
  }, [authState.isAuthenticated, authState.authHeaders, authenticate]);

  return {
    ...authState,
    authenticate,
    logout,
    getAuthHeaders,
    // Keep getToken for backward compatibility
    getToken: getAuthHeaders,
  };
}
