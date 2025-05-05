const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  wallet: { type: String, required: true, unique: true },
  ravBalance: { type: Number, default: 1000 },
  ravPoints: { type: Number, default: 0 }, // Add RAV Points field
  creatures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Creature' }],
});

module.exports = mongoose.model('User', userSchema);