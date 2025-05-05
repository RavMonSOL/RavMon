const { PublicKey, Connection, Transaction, SystemProgram } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createTransferInstruction } = require('@solana/spl-token');

const connection = new Connection(process.env.SOLANA_RPC, 'confirmed');
const ravTokenMint = new PublicKey(process.env.RAV_TOKEN_ADDRESS);
const rewardPool = new PublicKey(process.env.REWARD_POOL_ADDRESS);

const transferTokens = async (fromWallet, toWallet, amount) => {
  const fromTokenAccount = await getAssociatedTokenAddress(ravTokenMint, new PublicKey(fromWallet));
  const toTokenAccount = await getAssociatedTokenAddress(ravTokenMint, new PublicKey(toWallet));

  const transaction = new Transaction().add(
    createTransferInstruction(
      fromTokenAccount,
      toTokenAccount,
      new PublicKey(fromWallet),
      amount * 10 ** 9, // Assuming 9 decimals for $RAV
      [],
      TOKEN_PROGRAM_ID
    )
  );

  return transaction;
};

module.exports = { transferTokens, connection, ravTokenMint, rewardPool };
