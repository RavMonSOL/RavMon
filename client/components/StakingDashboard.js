// components/StakingDashboard.js
"use client";

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

export default function StakingDashboard({ publicKey }) {
  const [amount, setAmount] = useState('');
  const [staked, setStaked] = useState(0);
  const [points, setPoints] = useState(0);
  const { signTransaction, connected } = useWallet();

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const mockStakingAccount = new PublicKey('AZZcuHccVKtfLEi354hwo9P9JHhGkpsSf19WsevqxMPE'); // Replace with real staking account later

  const handleStake = async () => {
    if (!connected || !publicKey || !amount || !signTransaction) {
      alert('Please connect your wallet');
      return;
    }

    try {
      // Create a mock transaction (transfer SOL to simulate staking)
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: mockStakingAccount,
          lamports: parseFloat(amount) * 1_000_000_000, // Convert SOL to lamports (for simulation)
        })
      );

      // Fetch recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign the transaction (this will trigger the wallet prompt)
      const signedTransaction = await signTransaction(transaction);

      // Send the transaction to the blockchain
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction(signature);

      // Notify the backend to update the staking record
      const response = await fetch('/api/stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: publicKey.toString(), amount: parseFloat(amount) }),
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