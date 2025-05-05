export default function CreatureCard({ creature }) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
      <img
        src={creature.image || '/placeholder-creature.png'}
        alt={creature.name}
        className="w-full h-32 object-cover rounded-md"
      />
      <h3 className="text-lg font-bold mt-2 text-white">{creature.name}</h3>
      <p className="text-gray-300">Level: {creature.level}</p>
      <p className="text-gray-300">Health: {creature.health}</p>
      <p className="text-gray-300">Attack: {creature.attack}</p>
      <p className="text-gray-300">Defense: {creature.defense}</p>
    </div>
  );
}
