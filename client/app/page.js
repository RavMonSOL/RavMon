import WalletConnect from '../components/WalletConnect';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
      <h1 className="text-4xl font-bold mb-8 text-white">Creature Battle Game</h1>
      <WalletConnect />
      <div className="mt-8 space-y-4">
        <Link href="/shop" className="block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors">
          Shop
        </Link>
        <Link href="/battle/wild" className="block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md transition-colors">
          Battle Wild Creatures
        </Link>
        <Link href="/battle/player" className="block bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md transition-colors">
          Battle Players
        </Link>
        <Link href="/stake" className="block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-md transition-colors">
          Stake $RAV
        </Link>
        <Link href="/profile" className="block bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md transition-colors">
          Profile
        </Link>
      </div>
    </div>
  );
}
