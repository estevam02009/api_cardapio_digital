const mongoose = require('mongoose');

const kitchenOrderSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'preparing', 'ready', 'delivered'],
      default: 'pending'
    },
    startTime: Date,
    completionTime: Date,
    notes: String
  }],
  priority: {
    type: String,
    enum: ['normal', 'high', 'rush'],
    default: 'normal'
  },
  assignedTo: String
}, {
  timestamps: true
});

module.exports = mongoose.model('KitchenOrder', kitchenOrderSchema);