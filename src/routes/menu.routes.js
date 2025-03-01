const express = require('express');
const router = express.Router();
const multer = require('multer');
const QRCode = require('qrcode');
const MenuItem = require('../models/MenuItem');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Create menu item
router.post('/menu', upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const menuItem = new MenuItem({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      images: req.files.images ? req.files.images.map(file => file.path) : [],
      video: req.files.video ? req.files.video[0].path : null
    });

    // Generate QR Code
    const qrCodeData = await QRCode.toDataURL(JSON.stringify({
      id: menuItem._id,
      name: menuItem.name,
      price: menuItem.price
    }));
    menuItem.qrCode = qrCodeData;

    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all menu items
router.get('/menu', async (req, res) => {
  try {
    const menuItems = await MenuItem.find();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this new route
router.get('/menu/search', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, name } = req.query;
    let query = {};

    if (category) query.category = category;
    if (name) query.name = { $regex: name, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const menuItems = await MenuItem.find(query);
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get menu item by ID
router.get('/menu/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;