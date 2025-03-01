const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['food', 'beverage', 'equipment', 'cleaning', 'other'],
    required: true
  },
  contact: {
    email: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    }
  },
  products: [{
    name: String,
    code: String,
    unitPrice: Number,
    minimumOrder: Number,
    leadTime: Number // in days
  }],
  paymentTerms: {
    method: String,
    daysToPayment: Number
  },
  rating: {
    quality: Number,
    delivery: Number,
    price: Number
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Supplier', supplierSchema);