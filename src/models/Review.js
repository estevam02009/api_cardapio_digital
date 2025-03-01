const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: String,
  customerName: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);