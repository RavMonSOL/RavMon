const express = require('express');
const router = express.Router();
const Staking = require('../models/Staking');
// Remove unused import since staking is now client-side
// const { stakeTokens } = require('../solana/staking');

router.post('/', async (req, res) => {
  const { wallet, amount } = req.body;
  try {
    let staking = await Staking.findOne({ wallet });
    if (!staking) {
      staking = new Staking({ wallet });
    }

    // Remove the Solana staking call since it's handled on the client-side
    // await stakeTokens(wallet, amount);

    staking.amount += parseFloat(amount);
    await staking.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;