import { getChainId } from '@wagmi/core';
import { useCallback } from 'react';
import { type Address, formatUnits } from 'viem';
import {
  useAccount,
  useBalance,
  useReadContract,
  useReadContracts,
} from 'wagmi';
import { readContractsQueryKey } from 'wagmi/query';

import {
  boomplayExchangeABI,
  boomplayExchangeV2ABI,
  governanceContractABI,
  nftContractABI,
  usdcContractABI,
} from '@/config/contract';
import { wagmiConfig } from '@/config/wagmi';
import { Env } from '@/libs/Env';

export const useGetGovernanceConfig = () => {
  const { data, ...rest } = useReadContracts({
    contracts: [
      {
        abi: governanceContractABI,
        address: Env.NEXT_PUBLIC_GOVERNANCE_ADDRESS as Address,
        functionName: 'getMinTotalVote',
      },
      {
        abi: governanceContractABI,
        address: Env.NEXT_PUBLIC_GOVERNANCE_ADDRESS as Address,
        functionName: 'getMaxTotalVote',
      },
      {
        abi: governanceContractABI,
        address: Env.NEXT_PUBLIC_GOVERNANCE_ADDRESS as Address,
        functionName: 'DURATION_HOURS',
      },
      {
        abi: governanceContractABI,
        address: Env.NEXT_PUBLIC_GOVERNANCE_ADDRESS as Address,
        functionName: 'CONSTANT_REWARD_TOKEN',
      },
    ],
  });

  return {
    minVote: Number((data?.[0].result as bigint) ?? 0),
    maxVote: Number((data?.[1].result as bigint | undefined) ?? 0),
    questDuration: Number((data?.[2].result as bigint | undefined) ?? 0),
    reward: Number((data?.[3].result as bigint | undefined) ?? 0),
    data,
    ...rest,
  };
};

export const useNFTConfig = () => {
  const { data, ...rest } = useReadContracts({
    contracts: [
      {
        abi: governanceContractABI,
        address: Env.NEXT_PUBLIC_GOVERNANCE_ADDRESS as Address,
        functionName: 'MAX_VOTABLE_NFT',
      },
      {
        abi: governanceContractABI,
        address: Env.NEXT_PUBLIC_GOVERNANCE_ADDRESS as Address,
        functionName: 'MIN_REQUIRED_NFT',
      },
    ],
  });

  return {
    maxVotableNFT: Number((data?.[0].result as bigint) ?? 0),
    mintRequiredNFT: Number((data?.[1].result as bigint | undefined) ?? 0),
    data,
    ...rest,
  };
};

export const useTokenBalance = (tokenAddress: string, isNative?: boolean) => {
  const { address } = useAccount();

  // Native token balance (KAIA)
  const nativeBalance = useBalance({
    address,
    query: {
      enabled: !!address && !!isNative,
    },
  });

  // ERC20 token balance
  const params = {
    abi: usdcContractABI,
    address: tokenAddress as Address,
  };

  const { data, queryKey, ...rest } = useReadContracts({
    query: {
      enabled: !!address && !isNative,
    },
    contracts: [
      {
        ...params,
        functionName: 'balanceOf',
        args: [address],
      },
      {
        ...params,
        functionName: 'decimals',
      },
      {
        ...params,
        functionName: 'symbol',
      },
    ],
  });

  const getQueryKeys = useCallback(
    (tokenAddress: string) => {
      const params = {
        abi: usdcContractABI,
        address: tokenAddress as Address,
      };

      const chainId = getChainId(wagmiConfig);

      return readContractsQueryKey({
        chainId,
        contracts: [
          {
            ...params,
            functionName: 'balanceOf',
            args: [address],
          },
          {
            ...params,
            functionName: 'decimals',
          },
          {
            ...params,
            functionName: 'symbol',
          },
        ],
      });
    },
    [address],
  );

  // Return native token data
  if (isNative) {
    return {
      balance: nativeBalance.data?.value,
      decimals: nativeBalance.data?.decimals ?? 18,
      uiAmount: nativeBalance.data?.formatted ?? '0',
      symbol: nativeBalance.data?.symbol ?? 'KAIA',
      data: nativeBalance.data,
      getQueryKeys,
      queryKey: undefined,
      isLoading: nativeBalance.isLoading,
      refetch: nativeBalance.refetch,
      isError: nativeBalance.isError,
      error: nativeBalance.error,
    };
  }

  // Return ERC20 token data
  return {
    balance: data?.[0]?.result as bigint | undefined,
    decimals: (data?.[1]?.result ?? 0) as number,
    uiAmount: formatUnits(
      (data?.[0]?.result ?? 0) as bigint,
      (data?.[1]?.result ?? 0) as number,
    ),
    symbol: (data?.[2]?.result as string) ?? 'N/A',
    data,
    getQueryKeys,
    queryKey,
    ...rest,
  };
};

export const useBettingTokenBalance = (
  tokenAddress: string,
  isNative?: boolean,
) => {
  const { address } = useAccount();

  // Native token balance (KAIA)
  const nativeBalance = useBalance({
    address,
    query: {
      enabled: !!address && !!isNative,
    },
  });

  // ERC20 token balance
  const params = {
    abi: usdcContractABI,
    address: tokenAddress as Address,
  };

  const erc20Balance = useReadContracts({
    query: {
      enabled: !!address && !isNative,
    },
    contracts: [
      {
        ...params,
        functionName: 'balanceOf',
        args: [address],
      },
      {
        ...params,
        functionName: 'decimals',
      },
      {
        ...params,
        functionName: 'symbol',
      },
    ],
  });

  // Return native token data
  if (isNative) {
    return {
      balance: nativeBalance.data?.value,
      decimals: nativeBalance.data?.decimals ?? 18,
      uiAmount: nativeBalance.data?.formatted ?? '0',
      symbol: nativeBalance.data?.symbol ?? 'KAIA',
      data: nativeBalance.data,
      isLoading: nativeBalance.isLoading,
      refetch: nativeBalance.refetch,
      isError: nativeBalance.isError,
      error: nativeBalance.error,
    };
  }

  // Return ERC20 token data
  const { data, ...rest } = erc20Balance;
  return {
    balance: data?.[0]?.result as bigint | undefined,
    decimals: (data?.[1]?.result ?? 0) as number,
    uiAmount: formatUnits(
      (data?.[0]?.result ?? 0) as bigint,
      (data?.[1]?.result ?? 0) as number,
    ),
    symbol: (data?.[2]?.result as string) ?? 'N/A',
    data,
    ...rest,
  };
};

export const usePointTokenBalance = () => {
  const { address } = useAccount();

  const params = {
    abi: usdcContractABI,
    address: Env.NEXT_PUBLIC_POINT_TOKEN_ADDRESS as Address,
  };

  const { data, ...rest } = useReadContracts({
    query: {
      enabled: !!address,
    },
    contracts: [
      {
        ...params,
        functionName: 'balanceOf',
        args: [address],
      },
      {
        ...params,
        functionName: 'decimals',
      },
      {
        ...params,
        functionName: 'symbol',
      },
    ],
  });

  return {
    balance: data?.[0]?.result as bigint | undefined,
    decimals: (data?.[1]?.result ?? 0) as number,
    uiAmount: formatUnits(
      (data?.[0]?.result ?? 0) as bigint,
      (data?.[1]?.result ?? 0) as number,
    ),
    symbol: (data?.[2]?.result as string) ?? 'N/A',
    data,
    ...rest,
  };
};

export const useGetTokenInfo = (address: string) => {
  const params = {
    abi: usdcContractABI,
    address: address as Address,
  };

  const { data, ...rest } = useReadContracts({
    contracts: [
      {
        ...params,
        functionName: 'decimals',
      },
      {
        ...params,
        functionName: 'symbol',
      },
    ],
  });

  return {
    decimals: Number(data?.[0]?.result ?? 0),
    symbol: (data?.[1]?.result as string) ?? 'N/A',
    ...rest,
  };
};

export const useNFTBalance = () => {
  const { address } = useAccount();

  const { data, ...rest } = useReadContract({
    abi: nftContractABI,
    address: Env.NEXT_PUBLIC_NFT_ADDRESS as Address,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address,
    },
  });

  return {
    balance: Number(data ?? 0),
    ...rest,
  };
};

export const useExchangeRatio = (type: 'FP' | 'USDT') => {
  const { data, ...rest } = useReadContract({
    abi: type === 'FP' ? boomplayExchangeABI : boomplayExchangeV2ABI,
    address: (type === 'FP'
      ? Env.NEXT_PUBLIC_EXCHANGE_ADDRESS
      : Env.NEXT_PUBLIC_EXCHANGE_V2_ADDRESS) as Address,
    functionName: 'getRatio',
  });

  return {
    ratio: Number(data ?? 0),
    ...rest,
  };
};
