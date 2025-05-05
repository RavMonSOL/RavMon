"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import CreatureCard from '../../components/CreatureCard';
import { useState, useEffect } from 'react';
import { Transaction } from '@solana/web3.js';

const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://creature-battle-game-server.onrender.com';

const mockCreatures = [
  { id: 1, name: 'Firefang', health: 100, attack: 20, defense: 15, level: 1, price: 1000, image: '/firefang.png' },
  { id: 2, name: 'Aquaclaw', health: 90, attack: 18, defense: 20, level: 1, price: 1200, image: '/aquaclaw.png' },
];

export default function Shop() {
  const { publicKey, signTransaction, connected, connecting } = useWallet();
  const [creatures] = useState(mockCreatures);
  const [isWalletReady, setIsWalletReady] = useState(false);

  useEffect(() => {
    if (connected && !connecting && signTransaction) {
      setIsWalletReady(true);
    } else {
      setIsWalletReady(false);
    }
  }, [connected, connecting, signTransaction]);

  const buyCreature = async (creatureId, price) => {
    if (!isWalletReady || !publicKey || !signTransaction) {
      alert('Please connect your wallet and ensure it is fully loaded');
      return;
    }

    try {
      const walletAddress = publicKey.toBase58();
      console.log('Sending wallet address:', walletAddress);

      const prepareResponse = await fetch(`${API_BASE_URL}/api/shop/buy/prepare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatureId, wallet: walletAddress, price }),
      });
      const prepareData = await prepareResponse.json();
      if (!prepareResponse.ok) throw new Error(prepareData.error || 'Failed to prepare transaction');

      const transaction = Transaction.from(Buffer.from(prepareData.transaction, 'base64'));
      const signedTransaction = await signTransaction(transaction);

      const executeResponse = await fetch(`${API_BASE_URL}/api/shop/buy/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signedTransaction: signedTransaction.serialize().toString('base64'),
          creatureId,
          wallet: walletAddress,
          price,
        }),
      });
      const executeData = await executeResponse.json();
      if (!executeResponse.ok) throw new Error(executeData.error || 'Failed to execute transaction');

      if (executeData.success) {
        alert('Creature purchased!');
      } else {
        alert('Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to purchase creature: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Creature Shop</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {creatures.map((creature) => (
          <div key={creature.id} className="flex flex-col items-center">
            <CreatureCard creature={creature} />
            <button
              onClick={() => buyCreature(creature.id, creature.price)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              disabled={!isWalletReady}
            >
              Buy for {creature.price} $RAV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}