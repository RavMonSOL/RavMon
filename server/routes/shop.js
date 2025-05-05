const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Creature = require('../models/Creature');
const { transferTokens, connection } = require('../solana/token');
const web3 = require('@solana/web3.js');

const { Transaction, PublicKey } = web3;

// Utility to validate a base58 string
const isValidBase58 = (str) => {
  const base58Alphabet = /^[1-9A-HJ-NP-Za-km-z]+$/;
  return base58Alphabet.test(str) && (str.length === 43 || str.length === 44);
};

router.post('/buy/prepare', async (req, res) => {
  const { creatureId, wallet, price } = req.body;
  try {
    console.log('Received wallet address:', wallet);

    if (!isValidBase58(wallet)) {
      return res.status(400).json({ error: 'Invalid wallet address: must be a valid base58 string' });
    }

    const user = await User.findOne({ wallet });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please ensure your wallet is connected.' });
    }

    const creatureData = {
      1: { name: 'Firefang', health: 100, attack: 20, defense: 15, level: 1 },
      2: { name: 'Aquaclaw', health: 90, attack: 18, defense: 20, level: 1 },
    };

    if (!creatureData[creatureId]) return res.status(404).json({ error: 'Creature not found' });

    const shopAccount = 'xjZHxLxrkxvj1ZWFYg9GKNXqFDb727tNAFF1RX2GZfX';
    if (!isValidBase58(shopAccount)) {
      return res.status(500).json({ error: 'Invalid shop account address: must be a valid base58 string' });
    }

    const transaction = await transferTokens(wallet, shopAccount, price);

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = new PublicKey(wallet);

    console.log('Transaction before serialization:', {
      recentBlockhash: transaction.recentBlockhash,
      feePayer: transaction.feePayer.toString(),
      instructions: transaction.instructions.length,
    });

    const serializedTransaction = transaction.serialize({ requireAllSignatures: false }).toString('base64');

    res.json({ transaction: serializedTransaction, creatureId });
  } catch (error) {
    console.error('Error preparing transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/buy/execute', async (req, res) => {
  const { signedTransaction, creatureId, wallet, price } = req.body;
  try {
    console.log('Received wallet address for execute:', wallet);

    if (!isValidBase58(wallet)) {
      return res.status(400).json({ error: 'Invalid wallet address: must be a valid base58 string' });
    }

    const user = await User.findOne({ wallet });
    if (!user) {
      return res.status(404).json({ error: 'User not found. Please ensure your wallet is connected.' });
    }

    const creatureData = {
      1: { name: 'Firefang', health: 100, attack: 20, defense: 15, level: 1 },
      2: { name: 'Aquaclaw', health: 90, attack: 18, defense: 20, level: 1 },
    };

    if (!creatureData[creatureId]) return res.status(404).json({ error: 'Creature not found' });

    const transaction = Transaction.from(Buffer.from(signedTransaction, 'base64'));
    const signature = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction(signature);

    const creature = new Creature({
      ...creatureData[creatureId],
      owner: wallet,
    });
    await creature.save();

    user.creatures.push(creature._id);
    user.ravBalance = (user.ravBalance || 0) - price;
    await user.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error executing transaction:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;