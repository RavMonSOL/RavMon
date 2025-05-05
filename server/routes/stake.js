const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/', async (req, res) => {
  const { wallet, amount } = req.body;
  try {
    const user = await User.findOne({ wallet });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please ensure your wallet is connected.' });
    }

    user.ravBalance = (user.ravBalance || 0) + amount;
    user.points += Math.floor(amount / 100);
    await user.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;