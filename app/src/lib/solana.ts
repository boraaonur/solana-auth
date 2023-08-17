import { Adapter } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  BackpackWalletAdapter,
  GlowWalletAdapter,
  LedgerWalletAdapter,
  UnsafeBurnerWalletAdapter,
  BraveWalletAdapter,
  TrustWalletAdapter,
  CoinbaseWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

export const wallets: Adapter[] = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  new BackpackWalletAdapter(),
  new GlowWalletAdapter(),
  new LedgerWalletAdapter(),
  new UnsafeBurnerWalletAdapter(),

  new BraveWalletAdapter(),
  new TrustWalletAdapter(),
  new CoinbaseWalletAdapter(),
  new TorusWalletAdapter(),
];

export const endpoint = clusterApiUrl("devnet");
