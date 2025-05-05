const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Creature = require('../models/Creature');
const { transferTokens } = require('../solana/token');

router.post('/buy', async (req, res) => {
  const { creatureId, wallet, price } = req.body;
  try {
    const user = await User.findOne({ wallet });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const creatureData = {
      1: { name: 'Firefang', health: 100, attack: 20, defense: 15, level: 1 },
      2: { name: 'Aquaclaw', health: 90, attack: 18, defense: 20, level: 1 },
    };

    if (!creatureData[creatureId]) return res.status(404).json({ error: 'Creature not found' });

    if (user.ravBalance < price) return res.status(400).json({ error: 'Insufficient $RAV' });

    await transferTokens(wallet, 'SHOP_ADDRESS', price);

    const creature = new Creature({
      ...creatureData[creatureId],
      owner: wallet,
    });
    await creature.save();

    user.creatures.push(creature._id);
    user.ravBalance -= price;
    await user.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
