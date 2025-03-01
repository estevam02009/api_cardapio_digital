const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');

// Register new customer
router.post('/loyalty/customers', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add loyalty points
router.post('/loyalty/points/:customerId', async (req, res) => {
  try {
    const { points, orderId } = req.body;
    const customer = await Customer.findById(req.params.customerId);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    customer.loyaltyPoints += points;
    customer.orderHistory.push(orderId);
    customer.lastVisit = new Date();

    // Update membership level based on points
    if (customer.loyaltyPoints >= 1000) {
      customer.membershipLevel = 'platinum';
    } else if (customer.loyaltyPoints >= 500) {
      customer.membershipLevel = 'gold';
    } else if (customer.loyaltyPoints >= 200) {
      customer.membershipLevel = 'silver';
    }

    await customer.save();

    // Notify customer of points earned
    await new Notification({
      type: 'alert',
      title: 'Points Earned',
      message: `You earned ${points} points! Total: ${customer.loyaltyPoints}`,
      targetStaff: ['manager']
    }).save();

    res.json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get customer preferences and recommendations
router.get('/loyalty/recommendations/:customerId', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.customerId)
      .populate('preferences.favoriteItems')
      .populate('orderHistory');

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Generate personalized recommendations based on order history
    const recommendations = await generateRecommendations(customer);

    res.json({
      customerPreferences: customer.preferences,
      recommendations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update customer preferences
router.patch('/loyalty/preferences/:customerId', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.customerId,
      { preferences: req.body },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get loyalty program statistics
router.get('/loyalty/stats', async (req, res) => {
  try {
    const stats = await Customer.aggregate([
      {
        $group: {
          _id: '$membershipLevel',
          count: { $sum: 1 },
          averagePoints: { $avg: '$loyaltyPoints' },
          totalCustomers: { $sum: 1 }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;