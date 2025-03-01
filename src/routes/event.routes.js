const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Notification = require('../models/Notification');

// Create new event
router.post('/events', async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();

    // Notify managers about new event request
    await new Notification({
      type: 'alert',
      title: 'New Event Request',
      message: `New ${event.type} event request for ${event.date}`,
      priority: 'high',
      targetStaff: ['manager']
    }).save();

    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all events
router.get('/events', async (req, res) => {
  try {
    const { status, type, startDate, endDate } = req.query;
    let query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const events = await Event.find(query)
      .populate('menu.items.menuItem')
      .populate('staffAssigned')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update event status
router.patch('/events/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('menu.items.menuItem staffAssigned');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Notify staff if event is confirmed
    if (status === 'confirmed') {
      await new Notification({
        type: 'alert',
        title: 'Event Confirmed',
        message: `Event ${event.name} has been confirmed for ${event.date}`,
        targetStaff: ['manager', 'kitchen']
      }).save();
    }

    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Assign staff to event
router.post('/events/:id/staff', async (req, res) => {
  try {
    const { staffIds } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: { staffAssigned: staffIds } },
      { new: true }
    ).populate('staffAssigned');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;