const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');

// Submit feedback
router.post('/feedback', async (req, res) => {
  try {
    const feedback = new Feedback(req.body);
    await feedback.save();

    // Create notification for staff
    const notification = new Notification({
      type: 'feedback',
      title: `New ${feedback.type} Received`,
      message: `${feedback.type}: ${feedback.subject}`,
      priority: feedback.priority,
      targetStaff: ['manager']
    });
    await notification.save();

    res.status(201).json(feedback);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all feedback
router.get('/feedback', async (req, res) => {
  try {
    const { status, type } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (type) query.type = type;

    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update feedback status
router.patch('/feedback/:id', async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;