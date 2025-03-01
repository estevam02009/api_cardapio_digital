const express = require('express');
const router = express.Router();
const GiftCard = require('../models/GiftCard');
const crypto = require('crypto');

// Generate unique code
const generateUniqueCode = () => {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
};

// Create gift card
router.post('/giftcards', async (req, res) => {
  try {
    const giftCard = new GiftCard({
      ...req.body,
      code: generateUniqueCode(),
      balance: req.body.value
    });
    await giftCard.save();
    res.status(201).json(giftCard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Verify gift card
router.get('/giftcards/verify/:code', async (req, res) => {
  try {
    const giftCard = await GiftCard.findOne({ 
      code: req.params.code,
      status: 'active'
    });

    if (!giftCard) {
      return res.status(404).json({ error: 'Invalid or expired gift card' });
    }

    if (giftCard.expiryDate && new Date() > giftCard.expiryDate) {
      giftCard.status = 'expired';
      await giftCard.save();
      return res.status(400).json({ error: 'Gift card has expired' });
    }

    res.json(giftCard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Redeem gift card
router.post('/giftcards/:code/redeem', async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    const giftCard = await GiftCard.findOne({ code: req.params.code });

    if (!giftCard || giftCard.status !== 'active') {
      return res.status(404).json({ error: 'Invalid gift card' });
    }

    if (giftCard.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    giftCard.balance -= amount;
    giftCard.usageHistory.push({
      orderId,
      amountUsed: amount,
      date: new Date()
    });

    if (giftCard.balance === 0) {
      giftCard.status = 'used';
    }

    await giftCard.save();
    res.json(giftCard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get gift card history
router.get('/giftcards/:code/history', async (req, res) => {
  try {
    const giftCard = await GiftCard.findOne({ code: req.params.code })
      .populate('usageHistory.orderId')
      .populate('redeemedBy');

    if (!giftCard) {
      return res.status(404).json({ error: 'Gift card not found' });
    }

    res.json(giftCard.usageHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;