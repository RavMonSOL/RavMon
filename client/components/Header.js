"use client";

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Header() {
  const { publicKey } = useWallet();

  return (
    <header className="bg-gray-900 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <h1 className="text-2xl font-bold text-white">Creature Battle Game</h1>
        </Link>
        <div className="flex items-center space-x-4">
          {publicKey && (
            <Link href="/profile">
              <span className="text-white hover:text-gray-300 transition-colors">
                Profile ({publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)})
              </span>
            </Link>
          )}
          <WalletMultiButton className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors" />
        </div>
      </div>
    </header>
  );
}