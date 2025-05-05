const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get user data
router.get('/:wallet', async (req, res) => {
  try {
    const user = await User.findOne({ wallet: req.params.wallet }).populate('creatures');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user
router.post('/create', async (req, res) => {
  const { wallet } = req.body;
  try {
    let user = await User.findOne({ wallet });
    if (!user) {
      user = new User({ wallet, ravBalance: 1000, ravPoints: 0 });
      await user.save();
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update RAV Points
router.post('/update-points', async (req, res) => {
  const { wallet, points } = req.body;
  try {
    const user = await User.findOne({ wallet });
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.ravPoints = (user.ravPoints || 0) + points;
    await user.save();
    res.json({ success: true, ravPoints: user.ravPoints });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;