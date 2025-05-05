const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Creature = require('../models/Creature');

router.get('/:wallet', async (req, res) => {
  try {
    let user = await User.findOne({ wallet: req.params.wallet }).populate('creatures');
    if (!user) {
      user = new User({ wallet: req.params.wallet });
      await user.save();
    }
    res.json({
      creatures: user.creatures || [],
      points: user.points || 0,
      ravBalance: user.ravBalance || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
