import { createConfig } from '@privy-io/wagmi';
import { createClient, createPublicClient, http } from 'viem';
import { kaia, kairos } from 'wagmi/chains';
import {
  coinbaseWallet,
  metaMask,
  safe,
} from 'wagmi/connectors';

import { Env } from '@/libs/Env';

const network = Env.NEXT_PUBLIC_NETWORK === 'mainnet' ? kaia : kairos;
const chain = {
  ...network,
  rpcUrls: {
    default: { http: [`${Env.NEXT_PUBLIC_FE_URL}/api/rpc`] },
  },
};

export const wagmiConfig = createConfig({
  chains: [chain],
  connectors: [
    safe(),
    coinbaseWallet(),
    metaMask({ preferDesktop: true }),
  ],
  client({ chain }) {
    return createClient({ chain, transport: http() });
  },
});

export const publicClient = createPublicClient({
  chain: network,
  transport: http(),
});

export const getGasPrice = () => {
  if (Env.NEXT_PUBLIC_NETWORK === 'testnet') {
    return Promise.resolve(BigInt(5000000000));
  }
  return publicClient.getGasPrice();
};

export const supportedConnectorIds = [
  'metaMaskSDK',
  'safe',
  'coinbaseWalletSDK',
];

export const connectorIdToIconMap = {
  metaMaskSDK: '/assets/icons/meta Mask.png',
  safe: '/assets/icons/safepal.png',
  coinbaseWalletSDK: '/assets/icons/safepal.png',
};
