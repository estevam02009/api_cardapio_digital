const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['private-party', 'corporate', 'wedding', 'birthday', 'catering', 'special-menu'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    start: String,
    end: String
  },
  guestCount: {
    min: Number,
    max: Number,
    confirmed: Number
  },
  menu: {
    items: [{
      menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem'
      },
      quantity: Number,
      specialRequests: String
    }],
    customItems: [{
      name: String,
      description: String,
      price: Number,
      quantity: Number
    }]
  },
  services: [{
    name: String,
    description: String,
    price: Number
  }],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  totalCost: Number,
  deposit: Number,
  contactPerson: {
    name: String,
    email: String,
    phone: String
  },
  staffAssigned: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }],
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);