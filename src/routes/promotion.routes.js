const express = require('express');
const router = express.Router();
const Promotion = require('../models/Promotion');

// Create promotion
router.post('/promotions', async (req, res) => {
  try {
    const promotion = new Promotion(req.body);
    await promotion.save();
    res.status(201).json(promotion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get active promotions
router.get('/promotions', async (req, res) => {
  try {
    const currentDate = new Date();
    const promotions = await Promotion.find({
      isActive: true,
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    }).populate('menuItem');
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;