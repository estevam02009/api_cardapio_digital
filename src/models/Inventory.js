const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  ingredient: {
    type: String,
    required: true,
    unique: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  minimumLevel: {
    type: Number,
    required: true
  },
  lastRestockDate: Date,
  expirationDate: Date,
  supplier: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Inventory', inventorySchema);