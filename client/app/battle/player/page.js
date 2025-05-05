"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import CreatureCard from '../../../components/CreatureCard';
import { io } from 'socket.io-client';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount, createTransferInstruction, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://creature-battle-game-server.onrender.com';

export default function PlayerBattle() {
  const { publicKey, signTransaction, connected } = useWallet();
  const [playerCreature, setPlayerCreature] = useState(null);
  const [opponentCreature, setOpponentCreature] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [isWalletReady, setIsWalletReady] = useState(false);
  const [socket, setSocket] = useState(null);

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const ravTokenMint = new PublicKey('GxvN3Xi1XmnnWRVBwxYQY8FUSfqLES4YpSERrRX7MLPN');
  const feeReceiver = new PublicKey('xjZHxLxrkxvj1ZWFYg9GKNXqFDb727tNAFF1RX2GZfX');
  const ENTRY_FEE = 10;

  useEffect(() => {
    if (connected && publicKey && signTransaction) {
      setIsWalletReady(true);

      const newSocket = io(API_base_url);
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
      });

      newSocket.on('matchFound', (data) => {
        setOpponentCreature(data.opponentCreature);
      });

      newSocket.on('battleResult', async (data) => {
        const playerWins = data.winner === publicKey.toBase58();
        setBattleResult({
          message: playerWins ? 'You won the battle!' : 'You lost the battle.',
          won: playerWins,
        });

        if (playerWins && opponentCreature) {
          const pointsEarned = opponentCreature.level * 10;
          const reimbursementPoints = ENTRY_FEE;
          const totalPoints = pointsEarned + reimbursementPoints;

          await fetch(`${API_BASE_URL}/api/user/update-points`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet: publicKey.toBase58(), points: totalPoints }),
          });
        }
      });

      return () => {
        newSocket.disconnect();
      };
    } else {
      setIsWalletReady(false);
    }
  }, [connected, publicKey, signTransaction, opponentCreature]);

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

  const joinQueue = async () => {
    if (!isWalletReady || !publicKey || !socket) {
      alert('Please connect your wallet');
      return;
    }

    try {
      await payEntryFee();
      const response = await fetch(`${API_BASE_URL}/api/battle/player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: publicKey.toBase58(), creatureId: 1 }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Failed to fetch creature');

      setPlayerCreature(data.playerCreature);
      socket.emit('joinQueue', { wallet: publicKey.toBase58(), creature: data.playerCreature });
    } catch (error) {
      console.error('Error joining queue:', error);
      alert('Failed to join queue: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Player vs Player Battle</h1>
      {!playerCreature ? (
        <div className="text-center">
          <button
            onClick={joinQueue}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md transition-colors"
            disabled={!isWalletReady}
          >
            Join Queue (Entry Fee: {ENTRY_FEE} $RAV)
          </button>
        </div>
      ) : !battleResult ? (
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Waiting for Opponent...</h2>
          <CreatureCard creature={playerCreature} />
        </div>
      ) : (
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Battle Result</h2>
          {opponentCreature && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold">Your Creature</h3>
                <CreatureCard creature={playerCreature} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Opponent Creature</h3>
                <CreatureCard creature={opponentCreature} />
              </div>
            </div>
          )}
          <p className="text-lg">{battleResult.message}</p>
          {battleResult.won && opponentCreature && (
            <p>
              You earned {opponentCreature.level * 10} RAV Points + {ENTRY_FEE} RAV Points (reimbursement)!
            </p>
          )}
          <button
            onClick={() => {
              setPlayerCreature(null);
              setOpponentCreature(null);
              setBattleResult(null);
            }}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Battle Again
          </button>
        </div>
      )}
    </div>
  );
}