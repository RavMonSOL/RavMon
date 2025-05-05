const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/wild', async (req, res) => {
  const { wallet, creatureId } = req.body;
  try {
    const user = await User.findOne({ wallet });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please ensure your wallet is connected.' });
    }

    const win = Math.random() > 0.5;
    if (win) {
      user.points += 10;
      await user.save();
      res.json({ win: true, points: 10 });
    } else {
      user.ravBalance = (user.ravBalance || 0) - 50;
      await user.save();
      res.json({ win: false, ravLost: 50 });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/player', async (req, res) => {
  const { wallet, creatureId } = req.body;
  try {
    const user = await User.findOne({ wallet });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please ensure your wallet is connected.' });
    }

    const win = Math.random() > 0.5;
    if (win) {
      user.points += 20;
      await user.save();
      res.json({ win: true, points: 20 });
    } else {
      user.ravBalance = (user.ravBalance || 0) - 100;
      await user.save();
      res.json({ win: false, ravLost: 100 });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;