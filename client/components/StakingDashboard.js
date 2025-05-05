"use client";

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction, getAccount } from '@solana/spl-token';

const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://creature-battle-game-server.onrender.com';

export default function StakingDashboard({ publicKey }) {
  const [amount, setAmount] = useState('');
  const [staked, setStaked] = useState(0);
  const [points, setPoints] = useState(0);
  const { signTransaction, connected } = useWallet();

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const ravTokenMint = new PublicKey('GxvN3Xi1XmnnWRVBwxYQY8FUSfqLES4YpSERrRX7MLPN');
  const mockStakingAccount = new PublicKey('AbCdEfGhIjKlMnOpQrStUvWxYz1234567890');

  const handleStake = async () => {
    if (!connected || !publicKey || !amount || !signTransaction) {
      alert('Please connect your wallet');
      return;
    }

    try {
      const balance = await connection.getBalance(publicKey);
      console.log(`Wallet balance: ${balance / 1_000_000_000} SOL`);
      if (balance < 0.001 * 1_000_000_000) {
        alert('Insufficient SOL for transaction fees. You need at least 0.001 SOL.');
        return;
      }

      const userTokenAccount = await getAssociatedTokenAddress(ravTokenMint, publicKey);
      let userAccountInfo;
      try {
        userAccountInfo = await getAccount(connection, userTokenAccount);
      } catch (error) {
        if (error.message.includes('TokenAccountNotFound')) {
          const transaction = new Transaction().add(
            createAssociatedTokenAccountInstruction(
              publicKey,
              userTokenAccount,
              publicKey,
              ravTokenMint
            )
          );
          const { blockhash } = await connection.getLatestBlockhash();
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = publicKey;
          const signedTx = await signTransaction(transaction);
          const signature = await connection.sendRawTransaction(signedTx.serialize());
          await connection.confirmTransaction(signature);
          userAccountInfo = await getAccount(connection, userTokenAccount);
        } else {
          throw error;
        }
      }

      const stakingTokenAccount = await getAssociatedTokenAddress(ravTokenMint, mockStakingAccount);
      try {
        await getAccount(connection, stakingTokenAccount);
      } catch (error) {
        if (error.message.includes('TokenAccountNotFound')) {
          alert('Staking account ATA does not exist. Please set up the staking account.');
          return;
        } else {
          throw error;
        }
      }

      const userBalance = Number(userAccountInfo.amount) / 10 ** 9;
      const stakeAmount = parseFloat(amount);
      if (userBalance < stakeAmount) {
        alert(`Insufficient $RAV balance. You have ${userBalance} $RAV, but tried to stake ${stakeAmount} $RAV.`);
        return;
      }

      const transaction = new Transaction().add(
        createTransferInstruction(
          userTokenAccount,
          stakingTokenAccount,
          publicKey,
          stakeAmount * 10 ** 9,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signedTransaction = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction(signature);

      const walletAddress = publicKey.toBase58();
const response = await fetch(`${API_BASE_URL}/api/stake`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ wallet: walletAddress, amount: parseFloat(amount) }),
});
      const data = await response.json();

      if (data.success) {
        setStaked(staked + parseFloat(amount));
        setAmount('');
        alert('Successfully staked $RAV!');
      } else {
        alert('Staking failed');
      }
    } catch (error) {
      console.error('Staking error:', error);
      alert('Failed to stake: ' + error.message);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-white">Staking Dashboard</h2>
      <p className="text-gray-300">Staked $RAV: {staked}</p>
      <p className="text-gray-300">Earned Points: {points}</p>
      <div className="mt-4">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter $RAV to stake"
          className="bg-gray-700 text-white p-2 rounded-md mr-2"
        />
        <button
          onClick={handleStake}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Stake
        </button>
      </div>
    </div>
  );
}