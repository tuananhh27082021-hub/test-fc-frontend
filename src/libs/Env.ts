import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Don't add NODE_ENV into T3 Env, it changes the tree-shaking behavior
export const Env = createEnv({
  server: {
    RPC_URL: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_API_BASE_URL: z.string().min(1),
    NEXT_PUBLIC_FE_URL: z.string().min(1),
    NEXT_PUBLIC_WALLET_CONNECT_ID: z.string().min(1),

    NEXT_PUBLIC_GOVERNANCE_ADDRESS: z.string().min(1),
    NEXT_PUBLIC_BETTING_TOKEN_ADDRESS: z.string().min(1),
    NEXT_PUBLIC_NFT_ADDRESS: z.string().min(1),
    NEXT_PUBLIC_MARKET_ADDRESS: z.string().min(1),
    NEXT_PUBLIC_POINT_TOKEN_ADDRESS: z.string().min(1),
    NEXT_PUBLIC_BOOM_TOKEN_ADDRESS: z.string().min(1),
    NEXT_PUBLIC_EXCHANGE_ADDRESS: z.string().min(1),
    NEXT_PUBLIC_EXCHANGE_V2_ADDRESS: z.string().min(1),
    NEXT_PUBLIC_NETWORK: z.enum(['testnet', 'mainnet']),
  },
  shared: {
    NODE_ENV: z.enum(['test', 'development', 'production']),
  },
  // You need to destructure all the keys manually
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    RPC_URL: process.env.RPC_URL,
    // api
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_FE_URL: process.env.NEXT_PUBLIC_FE_URL,
    NEXT_PUBLIC_WALLET_CONNECT_ID: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID,
    // client
    NEXT_PUBLIC_GOVERNANCE_ADDRESS: process.env.NEXT_PUBLIC_GOVERNANCE_ADDRESS,
    NEXT_PUBLIC_BETTING_TOKEN_ADDRESS:
      process.env.NEXT_PUBLIC_BETTING_TOKEN_ADDRESS,
    NEXT_PUBLIC_NFT_ADDRESS: process.env.NEXT_PUBLIC_NFT_ADDRESS,
    NEXT_PUBLIC_MARKET_ADDRESS: process.env.NEXT_PUBLIC_MARKET_ADDRESS,
    NEXT_PUBLIC_POINT_TOKEN_ADDRESS:
      process.env.NEXT_PUBLIC_POINT_TOKEN_ADDRESS,
    NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK,
    NEXT_PUBLIC_BOOM_TOKEN_ADDRESS: process.env.NEXT_PUBLIC_BOOM_TOKEN_ADDRESS,
    NEXT_PUBLIC_EXCHANGE_ADDRESS: process.env.NEXT_PUBLIC_EXCHANGE_ADDRESS,
    NEXT_PUBLIC_EXCHANGE_V2_ADDRESS:
      process.env.NEXT_PUBLIC_EXCHANGE_V2_ADDRESS,
  },
});
