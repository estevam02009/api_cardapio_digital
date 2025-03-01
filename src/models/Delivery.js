const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'picked-up', 'in-transit', 'delivered', 'cancelled'],
    default: 'pending'
  },
  address: {
    street: String,
    number: String,
    complement: String,
    neighborhood: String,
    city: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  estimatedTime: Number,
  actualDeliveryTime: Date,
  deliveryFee: Number,
  customerContact: {
    name: String,
    phone: String
  },
  deliveryNotes: String,
  trackingUpdates: [{
    status: String,
    timestamp: Date,
    location: {
      latitude: Number,
      longitude: Number
    },
    notes: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Delivery', deliverySchema);