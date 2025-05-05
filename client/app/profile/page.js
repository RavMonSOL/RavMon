"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import CreatureCard from '../../components/CreatureCard';
import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token';

const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://creature-battle-game-server.onrender.com';

export default function Profile() {
  const { publicKey, connected } = useWallet();
  const [userData, setUserData] = useState(null);
  const [onChainRavBalance, setOnChainRavBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const ravTokenMint = new PublicKey('GxvN3Xi1XmnnWRVBwxYQY8FUSfqLES4YpSERrRX7MLPN');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!connected || !publicKey) {
        setLoading(false);
        return;
      }

      try {
        const walletAddress = publicKey.toBase58();
        const response = await fetch(`${API_BASE_URL}/api/user/${walletAddress}`);
        const data = await response.json();
        setUserData(data);

        const userTokenAccount = await getAssociatedTokenAddress(
          ravTokenMint,
          publicKey,
          false,
          TOKEN_2022_PROGRAM_ID
        );
        try {
          const accountInfo = await getAccount(connection, userTokenAccount, undefined, TOKEN_2022_PROGRAM_ID);
          const balance = Number(accountInfo.amount) / 10 ** 9;
          setOnChainRavBalance(balance);
        } catch (error) {
          if (error.message.includes('TokenAccountNotFound')) {
            setOnChainRavBalance(0);
          } else {
            console.error('Error fetching $RAV balance:', error);
            setOnChainRavBalance('Error');
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        alert('Failed to load profile: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [connected, publicKey]);

  if (loading) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }

  if (!connected || !publicKey) {
    return <div className="text-white text-center mt-10">Please connect your wallet to view your profile.</div>;
  }

  if (!userData) {
    return <div className="text-white text-center mt-10">User not found.</div>;
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Profile</h1> {/* Keep the title */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-white">Wallet: {publicKey.toBase58()}</h2>
        <p className="text-gray-300">On-Chain $RAV Balance: {onChainRavBalance !== null ? onChainRavBalance : 'Loading...'}</p>
        <p className="text-gray-300">Database $RAV Balance: {userData.ravBalance}</p>
        <p className="text-gray-300">RAV Points: {userData.ravPoints || 0}</p>
        <h3 className="text-lg font-semibold mt-4 mb-2 text-white">Your Creatures</h3>
        {userData.creatures.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userData.creatures.map((creature) => (
              <CreatureCard key={creature._id} creature={creature} />
            ))}
          </div>
        ) : (
          <p className="text-gray-300">You don’t have any creatures yet.</p>
        )}
      </div>
    </div>
  );
}