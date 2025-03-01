const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['sales', 'customer', 'menu', 'staff', 'table'],
    required: true
  },
  metrics: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  period: {
    start: Date,
    end: Date
  },
  tags: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Analytics', analyticsSchema);