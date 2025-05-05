"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import CreatureCard from '../../components/CreatureCard';
import { useState } from 'react';

const mockCreatures = [
  { id: 1, name: 'Firefang', health: 100, attack: 20, defense: 15, level: 1, price: 1000, image: '/firefang.png' },
  { id: 2, name: 'Aquaclaw', health: 90, attack: 18, defense: 20, level: 1, price: 1200, image: '/aquaclaw.png' },
];

export default function Shop() {
  const { publicKey } = useWallet();
  const [creatures] = useState(mockCreatures);

  const buyCreature = async (creatureId, price) => {
    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }
    const response = await fetch('/api/shop/buy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatureId, wallet: publicKey.toString(), price }),
    });
    const data = await response.json();
    if (data.success) {
      alert('Creature purchased!');
    } else {
      alert('Purchase failed');
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-white">Creature Shop</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {creatures.map((creature) => (
          <div key={creature.id} className="flex flex-col items-center">
            <CreatureCard creature={creature} />
            <button
              onClick={() => buyCreature(creature.id, creature.price)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Buy for {creature.price} $RAV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
