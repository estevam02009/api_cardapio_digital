const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');
const Notification = require('../models/Notification');

// Create delivery order
router.post('/delivery', async (req, res) => {
  try {
    const delivery = new Delivery(req.body);
    await delivery.save();

    // Notify available drivers
    await new Notification({
      type: 'alert',
      title: 'New Delivery Order',
      message: `New delivery request for order #${delivery.order}`,
      priority: 'high',
      targetStaff: ['driver']
    }).save();

    res.status(201).json(delivery);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Assign driver to delivery
router.patch('/delivery/:id/assign', async (req, res) => {
  try {
    const { driverId } = req.body;
    const delivery = await Delivery.findByIdAndUpdate(
      req.params.id,
      {
        driver: driverId,
        status: 'assigned',
        'trackingUpdates': [{
          status: 'assigned',
          timestamp: new Date(),
          notes: 'Driver assigned to delivery'
        }]
      },
      { new: true }
    ).populate('driver order');

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    res.json(delivery);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update delivery status
router.patch('/delivery/:id/status', async (req, res) => {
  try {
    const { status, location, notes } = req.body;
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    delivery.status = status;
    delivery.trackingUpdates.push({
      status,
      timestamp: new Date(),
      location,
      notes
    });

    if (status === 'delivered') {
      delivery.actualDeliveryTime = new Date();
    }

    await delivery.save();
    res.json(delivery);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get active deliveries
router.get('/delivery/active', async (req, res) => {
  try {
    const activeDeliveries = await Delivery.find({
      status: { $in: ['assigned', 'picked-up', 'in-transit'] }
    })
    .populate('driver order')
    .sort({ createdAt: -1 });

    res.json(activeDeliveries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get delivery statistics
router.get('/delivery/stats', async (req, res) => {
  try {
    const stats = await Delivery.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          averageDeliveryTime: {
            $avg: {
              $subtract: ['$actualDeliveryTime', '$createdAt']
            }
          },
          totalFees: { $sum: '$deliveryFee' }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;