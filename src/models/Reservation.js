const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  numberOfGuests: {
    type: Number,
    required: true
  },
  reservationDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  specialRequests: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Reservation', reservationSchema);