import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";
import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  getAssociatedTokenAddress,
  AuthorityType,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import {
  createCreateMetadataAccountV3Instruction,
  DataV2,
} from "@metaplex-foundation/mpl-token-metadata";
import { Helius, HeliusCluster } from "helius-sdk";
import {
  CLUSTER,
  HELIUS_API_KEY,
  MINT,
  PAYER,
  TOKEN_DECIMALS,
  TOKEN_METADATA_URI,
  TOKEN_MINT_AMOUNT,
  TOKEN_NAME,
  TOKEN_SYMBOL,
} from "./constants";
import { getTokenMetadataAddress } from "./utils";

(async () => {
  const helius = new Helius(HELIUS_API_KEY, CLUSTER as HeliusCluster);

  // Get the Associated Token Account (ATA) for the payer and the mint
  const ata = await getAssociatedTokenAddress(MINT.publicKey, PAYER.publicKey);

  // Define token metadata according to Metaplex standard
  const metadata: DataV2 = {
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    uri: TOKEN_METADATA_URI,
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
  };

  // Derive the PDA (Program Derived Address) for the metadata account
  const metadataPDA = getTokenMetadataAddress(MINT.publicKey);

  const tx = new Transaction().add(
    // 1️⃣ Create the mint account on-chain
    SystemProgram.createAccount({
      fromPubkey: PAYER.publicKey,
      newAccountPubkey: MINT.publicKey,
      space: MINT_SIZE,
      lamports: await helius.connection.getMinimumBalanceForRentExemption(
        MINT_SIZE
      ),
      programId: TOKEN_PROGRAM_ID,
    }),

    // 2️⃣ Initialize the mint (decimals, mint authority, no freeze authority)
    createInitializeMintInstruction(
      MINT.publicKey,
      TOKEN_DECIMALS,
      PAYER.publicKey, // mint authority
      null // no freeze authority
    ),

    // 3️⃣ Create an Associated Token Account (ATA) for holding the minted tokens
    createAssociatedTokenAccountInstruction(
      PAYER.publicKey,
      ata,
      PAYER.publicKey,
      MINT.publicKey
    ),

    // 4️⃣ Mint the initial supply of tokens to the ATA
    createMintToInstruction(
      MINT.publicKey,
      ata,
      PAYER.publicKey,
      TOKEN_MINT_AMOUNT
    ),

    // 5️⃣ Create the on-chain token metadata account
    createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataPDA,
        mint: MINT.publicKey,
        mintAuthority: PAYER.publicKey,
        payer: PAYER.publicKey,
        updateAuthority: PAYER.publicKey,
      },
      {
        createMetadataAccountArgsV3: {
          data: metadata,
          isMutable: false, // Set to false to make metadata immutable
          collectionDetails: null,
        },
      }
    ),

    // 6️⃣ Revoke mint authority (set to null) to prevent further minting
    createSetAuthorityInstruction(
      MINT.publicKey,
      PAYER.publicKey,
      AuthorityType.MintTokens,
      null
    )
  );

  // Send the transaction using Helius Smart RPC on mainnet, or standard confirmation elsewhere
  const sig =
    CLUSTER === "mainnet-beta"
      ? await helius.rpc.sendSmartTransaction(tx.instructions, [PAYER, MINT])
      : await sendAndConfirmTransaction(helius.connection, tx, [PAYER, MINT]);

  // Log useful on-chain addresses and transaction info
  console.log(`✅ Transaction: ${sig}`);
  console.log(`🔗 Mint Address: ${MINT.publicKey.toBase58()}`);
  console.log(`📦 ATA: ${ata.toBase58()}`);
  console.log(`📜 Metadata PDA: ${metadataPDA.toBase58()}`);
})();
