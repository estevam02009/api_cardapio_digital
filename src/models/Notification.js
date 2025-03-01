const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['order', 'reservation', 'feedback', 'alert'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  targetStaff: [{
    type: String,
    enum: ['kitchen', 'waiter', 'manager', 'all']
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);