const mongoose = require('mongoose');

const CreatureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  health: { type: Number, required: true },
  attack: { type: Number, required: true },
  defense: { type: Number, required: true },
  level: { type: Number, default: 1 },
  owner: { type: String, required: true },
});

module.exports = mongoose.model('Creature', CreatureSchema);
