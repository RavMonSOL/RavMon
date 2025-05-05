const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Creature = require('../models/Creature');
const Staking = require('../models/Staking');
const { contributeToPool } = require('../solana/rewardPool');

router.post('/wild', async (req, res) => {
  const { wallet, creatureId } = req.body;
  try {
    const user = await User.findOne({ wallet });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const creature = await Creature.findById(creatureId);
    if (!creature || creature.owner !== wallet) return res.status(404).json({ error: 'Creature not found' });

    const wildCreature = { health: 80, attack: 15, defense: 10 };

    const damageToWild = creature.attack - wildCreature.defense;
    const damageToPlayer = wildCreature.attack - creature.defense;

    if (damageToWild > damageToPlayer) {
      user.points += 500;
      creature.level += 1;
      creature.health += 10;
      creature.attack += 5;
      creature.defense += 5;
      await creature.save();
      await user.save();
      res.json({ win: true, points: 500 });
    } else {
      const ravLost = Math.floor(Math.random() * 50000) + 1;
      await contributeToPool(wallet, ravLost);
      user.ravBalance -= ravLost;
      await user.save();
      res.json({ win: false, ravLost });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/player', async (req, res) => {
  const { wallet, creatureId } = req.body;
  try {
    const user = await User.findOne({ wallet });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const creature = await Creature.findById(creatureId);
    if (!creature || creature.owner !== wallet) return res.status(404).json({ error: 'Creature not found' });

    const opponentCreature = { health: 90, attack: 18, defense: 12 };

    const damageToOpponent = creature.attack - opponentCreature.defense;
    const damageToPlayer = opponentCreature.attack - creature.defense;

    if (damageToOpponent > damageToPlayer) {
      let points = 600;
      const stakers = await Staking.find();
      const totalStaked = stakers.reduce((sum, s) => sum + s.amount, 0);
      const stakeFee = points * 0.04;
      points -= stakeFee;

      if (totalStaked > 0) {
        stakers.forEach(async (staker) => {
          staker.pointsEarned += (staker.amount / totalStaked) * stakeFee;
          await staker.save();
        });
      }

      user.points += points;
      creature.level += 1;
      creature.health += 10;
      creature.attack += 5;
      creature.defense += 5;
      await creature.save();
      await user.save();
      res.json({ win: true, points });
    } else {
      const ravLost = Math.floor(Math.random() * 50000) + 1;
      await contributeToPool(wallet, ravLost);
      user.ravBalance -= ravLost;
      await user.save();
      res.json({ win: false, ravLost });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
