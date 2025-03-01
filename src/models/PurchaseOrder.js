const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  items: [{
    product: {
      name: String,
      code: String
    },
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'ordered', 'received', 'cancelled'],
    default: 'draft'
  },
  totalAmount: Number,
  expectedDeliveryDate: Date,
  actualDeliveryDate: Date,
  notes: String,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);