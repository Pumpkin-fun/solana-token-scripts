//  Name of the token
export const TOKEN_NAME = "FIVE TEST";

// Ticker / Symbol for the token
export const TOKEN_SYMBOL = "FIVET";

// 🖼️ URI pointing to the token's metadata (image, description, etc.)
export const TOKEN_METADATA_URI =
  "https://ipfs.io/ipfs/QmRYtfX77EKu4m1ZkGTxZs66A5Dnoxod7GeWsRjxE3UAqC/0";

// Note: Do not change this as Pumpkin only supports 6 decimals and it is also a standard for fungible tokens on solana
export const TOKEN_DECIMALS = 6;


export const UNITS_PER_TOKEN = 10 ** TOKEN_DECIMALS;

// TTotal number of tokens to mint or Initial supply of the token
export const TOKEN_MINT_AMOUNT = 1_200_000_000 * UNITS_PER_TOKEN; // 1.2 billion tokens
