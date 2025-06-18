import "dotenv/config";
import { privateKeyToKeypair } from "../utils";

// Helius API key for RPC
export const HELIUS_API_KEY = process.env.HELIUS_API_KEY || "";

// solana cluster
export const CLUSTER: "mainnet-beta" | "devnet" = (process.env.CLUSTER ||
  "devnet") as "mainnet-beta" | "devnet";

// Address paying for tx
export const PAYER = privateKeyToKeypair(process.env.PAYER_PRIVATE_KEY || "");

// Address of token mint to create
export const MINT = privateKeyToKeypair(process.env.MINT_PRIVATE_KEY || "");
