import './globals.css';
import { SolanaProvider } from '../utils/solana';

export const metadata = {
  title: 'Creature Battle Game',
  description: 'A Pokémon-like game with Solana integration',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SolanaProvider>{children}</SolanaProvider>
      </body>
    </html>
  );
}
