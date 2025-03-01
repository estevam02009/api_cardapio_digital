const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: String,
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  membershipLevel: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  preferences: {
    favoriteItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
    dietaryRestrictions: [String],
    allergens: [String]
  },
  orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  lastVisit: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);