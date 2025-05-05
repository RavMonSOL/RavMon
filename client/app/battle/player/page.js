"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import BattleScreen from '../../../components/BattleScreen';
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function PlayerBattle() {
  const { publicKey } = useWallet();
  const [playerCreature] = useState({
    name: 'Player Creature',
    health: 100,
    attack: 20,
    defense: 15,
    level: 1,
  });
  const [opponent, setOpponent] = useState(null);

  useEffect(() => {
    if (publicKey) {
      socket.emit('joinQueue', { wallet: publicKey.toString(), creature: playerCreature });
      socket.on('matchFound', (opponentData) => {
        setOpponent(opponentData.creature);
      });
    }
    return () => socket.off('matchFound');
  }, [publicKey]);

  const handleAttack = async () => {
    if (!publicKey || !opponent) return;
    const response = await fetch('/api/battle/player', {
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
      {opponent ? (
        <BattleScreen
          playerCreature={playerCreature}
          opponent={opponent}
          onAttack={handleAttack}
        />
      ) : (
        <p className="text-xl text-white">Waiting for opponent...</p>
      )}
    </div>
  );
}
