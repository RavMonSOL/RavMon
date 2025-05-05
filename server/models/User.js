const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  wallet: { type: String, required: true, unique: true },
  creatures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Creature' }],
  points: { type: Number, default: 0 },
  ravBalance: { type: Number, default: 0 },
});

module.exports = mongoose.model('User', UserSchema);
