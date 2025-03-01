const express = require('express');
const router = express.Router();
const Table = require('../models/Table');
const QRCode = require('qrcode');

// Create table
router.post('/tables', async (req, res) => {
  try {
    const table = new Table(req.body);
    
    // Generate QR code for the table
    const qrCodeData = await QRCode.toDataURL(JSON.stringify({
      tableNumber: table.number,
      capacity: table.capacity
    }));
    table.qrCode = qrCodeData;

    await table.save();
    res.status(201).json(table);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all tables
router.get('/tables', async (req, res) => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update table status
router.patch('/tables/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }
    
    res.json(table);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;