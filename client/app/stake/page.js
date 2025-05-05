"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import StakingDashboard from '../../components/StakingDashboard';
import Link from 'next/link';

export default function Stake() {
  const { publicKey } = useWallet();

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <div className="flex justify-between items-center w-full mb-8">
        <h1 className="text-3xl font-bold text-white">Stake $RAV</h1>
        <Link href="/">
          <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors">
            Return to Menu
          </button>
        </Link>
      </div>
      {publicKey ? (
        <StakingDashboard publicKey={publicKey} />
      ) : (
        <p className="text-xl text-white">Please connect your wallet to stake $RAV</p>
      )}
    </div>
  );
}