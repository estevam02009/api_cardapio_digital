const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['waiter', 'kitchen', 'manager', 'admin'],
    required: true
  },
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: String,
    endTime: String
  }],
  status: {
    type: String,
    enum: ['active', 'on-leave', 'inactive'],
    default: 'active'
  },
  performanceMetrics: {
    ordersHandled: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    customerFeedback: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Feedback' }]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Staff', staffSchema);