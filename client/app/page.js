import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-5xl font-bold mb-8">Creature Battle Game</h1>
      <div className="space-y-4">
        <Link href="/shop">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors w-64">
            Shop
          </button>
        </Link>
        <Link href="/battle/wild">
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md transition-colors w-64">
            Wild Battle
          </button>
        </Link>
        <Link href="/battle/player">
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md transition-colors w-64">
            Player vs Player
          </button>
        </Link>
      </div>
    </div>
  );
}