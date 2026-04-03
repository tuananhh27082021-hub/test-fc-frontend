import { Env } from '@/libs/Env';

export function maskWalletAddress(
  address: string,
  startLength: number = 6,
  endLength: number = 4,
): string {
  // Ensure the input address is a valid Ethereum address
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error('Invalid Ethereum address');
  }

  // Truncate and mask the address
  const start = address.slice(0, startLength);
  const end = address.slice(-endLength);

  return `${start}...${end}`;
}

export function truncateSignature(
  signature: string,
  startLength: number = 6,
  endLength: number = 4,
): string {
  if (signature.length <= startLength + endLength) {
    return signature;
  }

  const start = signature.slice(0, startLength);
  const end = signature.slice(-endLength);

  return `${start}...${end}`;
}

export const getExplorerUrl = (type: 'address' | 'tx', value: string) => {
  const env = Env.NEXT_PUBLIC_NETWORK;

  if (env === 'mainnet') {
    return `https://kaiascan.io/${type}/${value}`;
  }

  return `https://kairos.kaiascan.io/${type}/${value}`;
};

export const shortenAddress = (address: string) => {
  return `${address.slice(0, 10)}...${address.slice(-10)}`;
};
