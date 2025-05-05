const { PublicKey, Connection, Transaction, SystemProgram } = require('@solana/web3.js');
const { TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddress, createTransferInstruction } = require('@solana/spl-token');

const connection = new Connection(process.env.SOLANA_RPC, 'confirmed');
let ravTokenMint;
try {
  ravTokenMint = new PublicKey(process.env.RAV_TOKEN_ADDRESS);
} catch (error) {
  console.error('Invalid RAV_TOKEN_ADDRESS:', error.message);
  throw new Error('Failed to initialize RAV token mint');
}
const rewardPool = 'mock-reward-pool-address';

const transferTokens = async (fromWallet, toWallet, amount) => {
  try {
    const fromTokenAccount = await getAssociatedTokenAddress(
      ravTokenMint,
      new PublicKey(fromWallet),
      false,
      TOKEN_2022_PROGRAM_ID
    );
    const toTokenAccount = await getAssociatedTokenAddress(
      ravTokenMint,
      new PublicKey(toWallet),
      false,
      TOKEN_2022_PROGRAM_ID
    );

    const transaction = new Transaction().add(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        new PublicKey(fromWallet),
        amount * 10 ** 9,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    );

    return transaction;
  } catch (error) {
    console.error('Error creating token transfer transaction:', error.message);
    throw error;
  }
};

module.exports = { transferTokens, connection, ravTokenMint, rewardPool };