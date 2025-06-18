import {
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
} from "@solana/spl-token";
import {
  CLUSTER,
  HELIUS_API_KEY,
  PAYER,
  NFT_MINT,
  PUMPKIN_LIQUIDITY_MANAGER_AUTH_ID,
} from "./constants";
import { Helius, HeliusCluster } from "helius-sdk";

(async () => {
  const helius = new Helius(HELIUS_API_KEY, CLUSTER as HeliusCluster);

  // Define source and destination addresses
  const sender = PAYER.publicKey;
  const recipient = new PublicKey(PUMPKIN_LIQUIDITY_MANAGER_AUTH_ID);

  // Derive sender and recipient ATAs
  const senderATA = await getAssociatedTokenAddress(NFT_MINT, sender);
  const recipientATA = await getAssociatedTokenAddress(NFT_MINT, recipient, true);

  // Build transaction
  const tx = new Transaction();

  // 1️⃣ Create recipient ATA if it doesn't exist
  const recipientInfo = await helius.connection.getAccountInfo(recipientATA);
  if (!recipientInfo) {
    tx.add(
      createAssociatedTokenAccountInstruction(
        sender,          // payer
        recipientATA,    // ATA to create
        recipient,       // owner of ATA
        NFT_MINT         // token mint
      )
    );
  }

  // 2️⃣ Transfer NFT (amount = 1)
  tx.add(
    createTransferInstruction(
      senderATA,
      recipientATA,
      sender,
      1 // NFTs always transfer amount 1
    )
  );

  // Send transaction
  const sig =
    CLUSTER === "mainnet-beta"
      ? await helius.rpc.sendSmartTransaction(tx.instructions, [PAYER])
      : await sendAndConfirmTransaction(helius.connection, tx, [PAYER]);

  console.log(`✅ NFT transferred in tx: ${sig}`);
  console.log(`🎁 Sent to ATA: ${recipientATA.toBase58()}`);
})();
