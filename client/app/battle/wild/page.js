"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import CreatureCard from '../../../components/CreatureCard';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount, createTransferInstruction, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://creature-battle-game-server.onrender.com';

const mockWildCreatures = [
  { id: 1, name: 'Wild Firefang', health: 80, attack: 15, defense: 10, level: 1 },
  { id: 2, name: 'Wild Aquaclaw', health: 70, attack: 12, defense: 15, level: 2 },
];

export default function WildBattle() {
  const { publicKey, signTransaction, connected } = useWallet();
  const [wildCreatures] = useState(mockWildCreatures);
  const [selectedCreature, setSelectedCreature] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [isWalletReady, setIsWalletReady] = useState(false);

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const ravTokenMint = new PublicKey('GxvN3Xi1XmnnWRVBwxYQY8FUSfqLES4YpSERrRX7MLPN');
  const feeReceiver = new PublicKey('xjZHxLxrkxvj1ZWFYg9GKNXqFDb727tNAFF1RX2GZfX');
  const ENTRY_FEE = 10;

  useEffect(() => {
    if (connected && publicKey && signTransaction) {
      setIsWalletReady(true);
    } else {
      setIsWalletReady(false);
    }
  }, [connected, publicKey, signTransaction]);

  const payEntryFee = async () => {
    try {
      const userTokenAccount = await getAssociatedTokenAddress(
        ravTokenMint,
        publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      const feeReceiverAccount = await getAssociatedTokenAddress(
        ravTokenMint,
        feeReceiver,
        false,
        TOKEN_2022_PROGRAM_ID
      );

      const userAccountInfo = await getAccount(connection, userTokenAccount, undefined, TOKEN_2022_PROGRAM_ID);
      const userBalance = Number(userAccountInfo.amount) / 10 ** 9;
      if (userBalance < ENTRY_FEE) {
        throw new Error(`Insufficient $RAV balance. You need ${ENTRY_FEE} $RAV, but you have ${userBalance} $RAV.`);
      }

      await getAccount(connection, feeReceiverAccount, undefined, TOKEN_2022_PROGRAM_ID);

      const transaction = new Transaction().add(
        createTransferInstruction(
          userTokenAccount,
          feeReceiverAccount,
          publicKey,
          ENTRY_FEE * 10 ** 9,
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signedTransaction = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction(signature);

      return true;
    } catch (error) {
      console.error('Entry fee payment failed:', error);
      throw error;
    }
  };

  const fightWildCreature = async (wildCreature) => {
    if (!isWalletReady || !publicKey) {
      alert('Please connect your wallet');
      return;
    }

    try {
      await payEntryFee();
      setSelectedCreature(wildCreature);
      const response = await fetch(`${API_BASE_URL}/api/battle/wild`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: publicKey.toBase58(), creatureId: 1 }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Battle failed');

      const playerWins = data.result === 'win';
      setBattleResult({
        message: playerWins ? 'You won the battle!' : 'You lost the battle.',
        won: playerWins,
      });

      if (playerWins) {
        const pointsEarned = wildCreature.level * 10;
        const reimbursementPoints = ENTRY_FEE;
        const totalPoints = pointsEarned + reimbursementPoints;

        await fetch(`${API_BASE_URL}/api/user/update-points`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wallet: publicKey.toBase58(), points: totalPoints }),
        });
      }
    } catch (error) {
      console.error('Battle error:', error);
      alert('Failed to start battle: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Wild Battle</h1>
      {!selectedCreature ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wildCreatures.map((creature) => (
            <div key={creature.id} className="flex flex-col items-center">
              <CreatureCard creature={creature} />
              <button
                onClick={() => fightWildCreature(creature)}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
                disabled={!isWalletReady}
              >
                Fight (Entry Fee: {ENTRY_FEE} $RAV)
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Battling {selectedCreature.name}</h2>
          {battleResult ? (
            <>
              <p className="text-lg">{battleResult.message}</p>
              {battleResult.won && (
                <p>
                  You earned {selectedCreature.level * 10} RAV Points + {ENTRY_FEE} RAV Points (reimbursement)!
                </p>
              )}
              <button
                onClick={() => {
                  setSelectedCreature(null);
                  setBattleResult(null);
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Fight Another
              </button>
            </>
          ) : (
            <p>Battle in progress...</p>
          )}
        </div>
      )}
    </div>
  );
}