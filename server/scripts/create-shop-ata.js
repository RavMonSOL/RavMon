const { Connection, Keypair, PublicKey, Transaction } = require('@solana/web3.js');
const { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_2022_PROGRAM_ID } = require('@solana/spl-token');
const fs = require('fs');

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const shopKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync('shop-keypair.json', 'utf8'))));
const ravTokenMint = new PublicKey('GxvN3Xi1XmnnWRVBwxYQY8FUSfqLES4YpSERrRX7MLPN');

// Log the TOKEN_2022_PROGRAM_ID to verify
console.log('Using TOKEN_2022_PROGRAM_ID:', TOKEN_2022_PROGRAM_ID.toBase58());

async function createShopATA() {
  try {
    const shopTokenAccount = await getAssociatedTokenAddress(
      ravTokenMint,
      shopKeypair.publicKey,
      false, // allowOwnerOffCurve (set to false for now)
      TOKEN_2022_PROGRAM_ID // Use Token-2022 Program
    );

    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        shopKeypair.publicKey, // Payer
        shopTokenAccount,      // ATA
        shopKeypair.publicKey, // Owner
        ravTokenMint,          // Mint
        TOKEN_2022_PROGRAM_ID  // Use Token-2022 Program
      )
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = shopKeypair.publicKey;

    const signature = await connection.sendTransaction(transaction, [shopKeypair]);
    await connection.confirmTransaction(signature);

    console.log('Shop ATA created:', shopTokenAccount.toBase58());
  } catch (error) {
    console.error('Error creating shop ATA:', error);
    if (error.transactionLogs) {
      console.error('Transaction logs:', error.transactionLogs);
    }
  }
}

createShopATA();