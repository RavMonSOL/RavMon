"use client";

import './globals.css';
import { Inter } from 'next/font/google';
import { WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';
import WalletUserSync from '../components/WalletUserSync';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import Header from '../components/Header'; // Import the Header component

import '@solana/wallet-adapter-react-ui/styles.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Header /> {/* Add the Header component */}
            <WalletUserSync />
            {children}
          </WalletModalProvider>
        </WalletProvider>
      </body>
    </html>
  );
}