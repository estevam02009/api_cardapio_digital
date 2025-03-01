const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const Notification = require('../models/Notification');

// Create staff member
router.post('/staff', async (req, res) => {
  try {
    const staff = new Staff(req.body);
    await staff.save();
    res.status(201).json(staff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all staff members
router.get('/staff', async (req, res) => {
  try {
    const { role, status } = req.query;
    let query = {};
    
    if (role) query.role = role;
    if (status) query.status = status;

    const staff = await Staff.find(query)
      .populate('performanceMetrics.customerFeedback');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update staff schedule
router.patch('/staff/:id/schedule', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { schedule: req.body.schedule },
      { new: true }
    );

    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    // Notify staff member of schedule change
    await new Notification({
      type: 'alert',
      title: 'Schedule Updated',
      message: 'Your work schedule has been updated',
      targetStaff: [staff.role],
      priority: 'high'
    }).save();

    res.json(staff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update performance metrics
router.patch('/staff/:id/performance', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    const { ordersHandled, averageRating, feedbackId } = req.body;

    if (ordersHandled) {
      staff.performanceMetrics.ordersHandled += ordersHandled;
    }
    if (averageRating) {
      staff.performanceMetrics.averageRating = averageRating;
    }
    if (feedbackId) {
      staff.performanceMetrics.customerFeedback.push(feedbackId);
    }

    await staff.save();
    res.json(staff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get staff schedule for a specific day
router.get('/staff/schedule/:day', async (req, res) => {
  try {
    const staff = await Staff.find({
      'schedule.day': req.params.day,
      status: 'active'
    });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;