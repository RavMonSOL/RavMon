"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import BattleScreen from '../../../components/BattleScreen';
import { useState } from 'react';

const mockWildCreature = {
  name: 'Wild Beast',
  health: 80,
  attack: 15,
  defense: 10,
  level: 1,
};

export default function WildBattle() {
  const { publicKey } = useWallet();
  const [playerCreature] = useState({
    name: 'Player Creature',
    health: 100,
    attack: 20,
    defense: 15,
    level: 1,
  });

  const handleAttack = async () => {
    if (!publicKey) {
      alert('Please connect your wallet');
      return;
    }
    const response = await fetch('/api/battle/wild', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet: publicKey.toString(), creatureId: 1 }),
    });
    const data = await response.json();
    if (data.win) {
      alert(`You won! Earned ${data.points} points`);
    } else {
      alert(`You lost ${data.ravLost} $RAV`);
    }
  };

  return (
    <div className="min-h-screen p-8 flex justify-center">
      <BattleScreen
        playerCreature={playerCreature}
        opponent={mockWildCreature}
        onAttack={handleAttack}
      />
    </div>
  );
}
