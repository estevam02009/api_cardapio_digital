const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');
const Notification = require('../models/Notification');

// Add supplier
router.post('/suppliers', async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create purchase order
router.post('/purchase-orders', async (req, res) => {
  try {
    const purchaseOrder = new PurchaseOrder(req.body);
    
    // Calculate total amount
    purchaseOrder.totalAmount = purchaseOrder.items.reduce(
      (total, item) => total + (item.quantity * item.unitPrice),
      0
    );
    
    await purchaseOrder.save();

    // Notify managers
    await new Notification({
      type: 'alert',
      title: 'New Purchase Order',
      message: `New PO created for ${purchaseOrder.totalAmount}`,
      priority: 'high',
      targetStaff: ['manager']
    }).save();

    res.status(201).json(purchaseOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get low stock alerts
router.get('/suppliers/low-stock', async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      quantity: { $lte: 'minimumLevel' }
    }).populate('supplier');
    
    res.json(lowStockItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update purchase order status
router.patch('/purchase-orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        ...(status === 'received' ? { actualDeliveryDate: new Date() } : {})
      },
      { new: true }
    ).populate('supplier');

    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    res.json(purchaseOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;