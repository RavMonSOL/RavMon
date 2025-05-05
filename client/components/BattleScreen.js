import CreatureCard from './CreatureCard';

export default function BattleScreen({ playerCreature, opponent, onAttack }) {
  return (
    <div className="flex flex-col items-center space-y-8">
      <h2 className="text-2xl font-bold text-white">Battle!</h2>
      <div className="flex space-x-8">
        <div>
          <h3 className="text-lg text-white">Your Creature</h3>
          <CreatureCard creature={playerCreature} />
        </div>
        <div>
          <h3 className="text-lg text-white">Opponent</h3>
          <CreatureCard creature={opponent} />
        </div>
      </div>
      <button
        onClick={onAttack}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md transition-colors"
      >
        Attack
      </button>
    </div>
  );
}
