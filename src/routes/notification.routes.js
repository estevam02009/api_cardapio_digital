const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get notifications
router.get('/notifications', async (req, res) => {
  try {
    const { status, targetStaff } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (targetStaff) query.targetStaff = targetStaff;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.patch('/notifications/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { status: 'read' },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create custom notification
router.post('/notifications', async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;