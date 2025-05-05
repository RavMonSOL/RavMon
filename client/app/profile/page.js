"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import CreatureCard from '../../components/CreatureCard';
import { useState, useEffect } from 'react';

export default function Profile() {
  const { publicKey } = useWallet();
  const [userData, setUserData] = useState({ creatures: [], points: 0, ravBalance: 0 });

  useEffect(() => {
    if (publicKey) {
      fetch(`/api/user/${publicKey.toString()}`)
        .then((res) => res.json())
        .then((data) => setUserData(data));
    }
  }, [publicKey]);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-white">Profile</h1>
      {publicKey ? (
        <div>
          <p className="text-gray-300">Wallet: {publicKey.toBase58().slice(0, 8)}...</p>
          <p className="text-gray-300">Points: {userData.points}</p>
          <p className="text-gray-300">$RAV Balance: {userData.ravBalance}</p>
          <h2 className="text-2xl font-bold mt-6 mb-4 text-white">Your Creatures</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userData.creatures.map((creature) => (
              <CreatureCard key={creature.id} creature={creature} />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xl text-center text-white">Please connect your wallet</p>
      )}
    </div>
  );
}
