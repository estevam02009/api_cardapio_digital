const mongoose = require('mongoose');

const marketingSchema = new mongoose.Schema({
  campaignName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['social-media', 'email', 'sms', 'push-notification'],
    required: true
  },
  platform: {
    type: String,
    enum: ['instagram', 'facebook', 'whatsapp', 'email', 'sms', 'all'],
    required: true
  },
  content: {
    title: String,
    message: String,
    images: [String],
    link: String
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    frequency: String
  },
  targetAudience: {
    ageRange: {
      min: Number,
      max: Number
    },
    preferences: [String],
    loyaltyLevel: [String]
  },
  metrics: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    engagement: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'completed', 'cancelled'],
    default: 'draft'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Marketing', marketingSchema);