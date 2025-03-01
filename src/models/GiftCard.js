const mongoose = require('mongoose');

const giftCardSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['gift-card', 'voucher', 'promo-code'],
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  balance: {
    type: Number,
    required: true
  },
  isPercentage: {
    type: Boolean,
    default: false
  },
  expiryDate: Date,
  status: {
    type: String,
    enum: ['active', 'used', 'expired', 'cancelled'],
    default: 'active'
  },
  restrictions: {
    minimumPurchase: Number,
    maxDiscount: Number,
    applicableItems: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem'
    }],
    applicableCategories: [String]
  },
  purchasedBy: {
    name: String,
    email: String,
    phone: String
  },
  redeemedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  usageHistory: [{
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    amountUsed: Number,
    date: Date
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('GiftCard', giftCardSchema);