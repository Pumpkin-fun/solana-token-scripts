import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";

export function privateKeyToKeypair(privateKey: string): Keypair {
  return Keypair.fromSecretKey(new Uint8Array(bs58.decode(privateKey)));
}

export function getTokenMetadataAddress(tokenMint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      tokenMint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  )[0];
}
