const mongoose = require('mongoose');

const StakingSchema = new mongoose.Schema({
  wallet: { type: String, required: true, unique: true },
  amount: { type: Number, default: 0 },
  pointsEarned: { type: Number, default: 0 },
});

module.exports = mongoose.model('Staking', StakingSchema);
