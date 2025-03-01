const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

// Create reservation
router.post('/reservations', async (req, res) => {
  try {
    const table = await Table.findById(req.body.table);
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    const reservation = new Reservation(req.body);
    await reservation.save();

    // Update table status
    table.status = 'reserved';
    await table.save();

    res.status(201).json(reservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all reservations
router.get('/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('table')
      .sort({ reservationDate: 1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update reservation status
router.patch('/reservations/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('table');

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Update table status based on reservation status
    if (status === 'cancelled') {
      await Table.findByIdAndUpdate(reservation.table._id, { status: 'available' });
    } else if (status === 'confirmed') {
      await Table.findByIdAndUpdate(reservation.table._id, { status: 'reserved' });
    }

    res.json(reservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;