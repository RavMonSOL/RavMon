"use client";

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';

export default function WalletConnect() {
  const { publicKey } = useWallet();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="flex items-center space-x-4">
      {publicKey && (
        <span className="text-sm text-gray-300">{publicKey.toBase58().slice(0, 8)}...</span>
      )}
      <WalletMultiButton
        className="!bg-blue-600 hover:!bg-blue-700 !text-white !px-4 !py-2 !rounded-md !transition-colors"
        style={{}}
      />
    </div>
  );
}
