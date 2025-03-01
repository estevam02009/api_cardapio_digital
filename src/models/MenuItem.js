const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  video: {
    type: String
  },
  qrCode: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MenuItem', menuItemSchema);