// app/stake/page.js
"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import StakingDashboard from '../../components/StakingDashboard';

export default function Stake() {
  const { publicKey } = useWallet();

  return (
    <div className="min-h-screen p-8 flex justify-center">
      {publicKey ? (
        <StakingDashboard publicKey={publicKey} />
      ) : (
        <p className="text-xl text-white">Please connect your wallet to stake $RAV</p>
      )}
    </div>
  );
}