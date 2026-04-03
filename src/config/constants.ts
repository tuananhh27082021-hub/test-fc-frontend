import { Env } from '@/libs/Env';

// filter options
export const filterDAOQuestsOptions = [
  { name: 'Draft', value: 'draft' },
  { name: 'Success', value: 'success' },
  { name: 'Answer', value: 'answer' },
];

// pagination
export const DEFAULT_PAGE_SIZE = 24;

export const tokenList = [
  {
    key: 'FP',
    name: 'FP',
    iconUrl: '/assets/icons/boom-point-icon.png',
  },
  {
    key: 'USDT',
    name: 'USDT',
    iconUrl: '/assets/icons/USDT.png',
  },
];

if (Env.NEXT_PUBLIC_NETWORK === 'testnet') {
  tokenList.push({
    key: 'USDT',
    name: 'USDT',
    iconUrl: '/assets/icons/USDT.png',
  });
}

export const OPINION_BOUNTY_CATEGORY = 'Opinion Bounty';

export interface BettingToken {
  address: string;
  symbol: string;
  name: string;
  iconUrl: string;
  isNative?: boolean;
  lockable?: boolean;
}

export const FAST_TOKEN_ADDRESS = '0x4ad546489e30015349a751384fedf0c894a7e4fa';

export const MARKET_MAP_TOKEN: Record<string, BettingToken> = {
  '0xcacf629926388f70a40ff5916fd1fda8517c994a': {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'KAIA',
    name: 'KAIA',
    iconUrl: '/assets/icons/kaia.png',
    isNative: true,
  },
  '0x9c74dd10a5da8348a673d9593fc72f8515b8cb0a': {
    address: FAST_TOKEN_ADDRESS,
    symbol: 'FAST',
    name: 'Forecast',
    iconUrl: '/assets/icons/fast.png',
    lockable: false,
  },
  '0x1890fee0f5b99725d1307b7686912a496230d6cc': {
    address: '0xd077a400968890eacc75cdc901f0356c943e4fdb',
    symbol: 'USDT',
    name: 'USDT',
    iconUrl: '/assets/icons/USDT.png',
  },
  '0xf9b4333b5a6912d174feecdcab42d2c50c13c3f7': {
    address: '0x16d0e1fbd024c600ca0380a4c5d57ee7a2ecbf9c',
    symbol: 'oWBTC',
    name: 'Orbit Bridge Klaytn Wrapped BTC',
    iconUrl: '/assets/icons/owbtc.png',
  },
  '0x8b1d2a676a47b8b52b28cedac54b287f4f93cb70': {
    address: '0x9eaefb09fe4aabfbe6b1ca316a3c36afc83a393f',
    symbol: 'oXRP',
    name: 'Orbit Bridge Klaytn Ripple',
    iconUrl: '/assets/icons/oxrp.png',
  },
  '0xd620e399234954433dab2e0bbeb0668cdc823d03': {
    address: '0x98a8345bb9d3dda9d808ca1c9142a28f6b0430e1',
    symbol: 'WETH',
    name: 'WETH (Portal from ETH)',
    iconUrl: '/assets/icons/weth.png',
  },
};

export const DOCS_URL = 'https://bedecked-mollusk-bb6.notion.site/FORECAST-Decentralized-Prediction-for-Asia-Built-on-KAIA-2b0787c86aa680afb04df77b2102e3d3';
