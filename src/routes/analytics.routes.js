const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');

// Menu performance analytics
router.get('/analytics/menu', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateQuery = {};
    if (startDate && endDate) {
      dateQuery.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const menuAnalytics = await Order.aggregate([
      { $match: dateQuery },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      {
        $lookup: {
          from: 'menuitems',
          localField: '_id',
          foreignField: '_id',
          as: 'menuItemDetails'
        }
      }
    ]);

    res.json(menuAnalytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Peak hours analysis
router.get('/analytics/peak-hours', async (req, res) => {
  try {
    const peakHours = await Order.aggregate([
      {
        $group: {
          _id: { $hour: '$createdAt' },
          orderCount: { $sum: 1 },
          averageAmount: { $avg: '$totalAmount' }
        }
      },
      { $sort: { orderCount: -1 } }
    ]);

    res.json(peakHours);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Table utilization analytics
router.get('/analytics/table-utilization', async (req, res) => {
  try {
    const tableAnalytics = await Order.aggregate([
      {
        $group: {
          _id: '$tableNumber',
          totalOrders: { $sum: 1 },
          averageAmount: { $avg: '$totalAmount' },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.json(tableAnalytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Customer behavior analytics
router.get('/analytics/customer-behavior', async (req, res) => {
  try {
    const behavior = await Order.aggregate([
      {
        $group: {
          _id: '$customer',
          visitFrequency: { $sum: 1 },
          averageSpending: { $avg: '$totalAmount' },
          favoriteItems: {
            $push: '$items.menuItem'
          }
        }
      }
    ]);

    res.json(behavior);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save analytics snapshot
router.post('/analytics/snapshot', async (req, res) => {
  try {
    const { type, metrics, period, tags } = req.body;
    const analytics = new Analytics({
      type,
      metrics,
      period,
      tags
    });
    await analytics.save();
    res.status(201).json(analytics);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;