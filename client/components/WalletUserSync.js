"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect } from 'react';

// Use environment variable to determine the API base URL
const API_BASE_URL = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://creature-battle-game-server.onrender.com';

export default function WalletUserSync() {
  const { publicKey, connected, connecting } = useWallet();

  useEffect(() => {
    if (connected && !connecting && publicKey) {
      // Wallet is fully connected, create the user in the database
      const createUser = async () => {
        try {
            const walletAddress = publicKey.toBase58();
            const response = await fetch(`${API_BASE_URL}/api/user/create`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ wallet: walletAddress }),
            });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Failed to create user');
          console.log('User creation response:', data);
        } catch (error) {
          console.error('Error creating user on wallet connect:', error);
        }
      };

      createUser();
    }
  }, [connected, connecting, publicKey]);

  return null; // This component doesn't render anything
}