const express = require('express');
const router = express.Router();
const KitchenOrder = require('../models/KitchenOrder');
const Inventory = require('../models/Inventory');
const Notification = require('../models/Notification');

// Get kitchen orders
router.get('/kitchen/orders', async (req, res) => {
  try {
    const { status, priority } = req.query;
    let query = {};
    
    if (status) query['items.status'] = status;
    if (priority) query.priority = priority;

    const orders = await KitchenOrder.find(query)
      .populate('orderId')
      .populate('items.menuItem')
      .sort({ priority: -1, createdAt: 1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update item status in kitchen order
router.patch('/kitchen/orders/:orderId/items/:itemId', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await KitchenOrder.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Kitchen order not found' });
    }

    const item = order.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    item.status = status;
    if (status === 'preparing') {
      item.startTime = new Date();
    } else if (status === 'ready') {
      item.completionTime = new Date();
      
      // Create notification for servers
      await new Notification({
        type: 'order',
        title: 'Order Ready',
        message: `Order ${order.orderId} item is ready for pickup`,
        targetStaff: ['waiter']
      }).save();
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Inventory routes
router.get('/kitchen/inventory', async (req, res) => {
  try {
    const inventory = await Inventory.find().sort({ ingredient: 1 });
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/kitchen/inventory', async (req, res) => {
  try {
    const inventory = new Inventory(req.body);
    await inventory.save();
    res.status(201).json(inventory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch('/kitchen/inventory/:id', async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!inventory) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Check if inventory is below minimum level
    if (inventory.quantity <= inventory.minimumLevel) {
      await new Notification({
        type: 'alert',
        title: 'Low Inventory Alert',
        message: `${inventory.ingredient} is running low (${inventory.quantity} ${inventory.unit} remaining)`,
        priority: 'high',
        targetStaff: ['manager', 'kitchen']
      }).save();
    }

    res.json(inventory);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;