const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const MenuItem = require('../models/MenuItem');

// Add review
router.post('/reviews', async (req, res) => {
  try {
    // Verify if menuItem exists before creating review
    const menuItem = await MenuItem.findById(req.body.menuItem);
    if (!menuItem) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    const review = new Review(req.body);
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get reviews for a menu item
router.get('/menu/:menuId/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ menuItem: req.params.menuId })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all reviews
router.get('/reviews', async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('menuItem', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;