const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

// Record new transaction
router.post('/financial/transactions', async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();

    if (transaction.type === 'expense' && transaction.amount > 1000) {
      await new Notification({
        type: 'alert',
        title: 'High Expense Alert',
        message: `New expense recorded: ${transaction.amount} - ${transaction.description}`,
        priority: 'high',
        targetStaff: ['manager']
      }).save();
    }

    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get financial summary
router.get('/financial/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const transactions = await Transaction.find(query);
    
    const summary = {
      totalSales: 0,
      totalExpenses: 0,
      totalRefunds: 0,
      netIncome: 0,
      paymentMethods: {},
      categories: {}
    };

    transactions.forEach(transaction => {
      if (transaction.type === 'sale') {
        summary.totalSales += transaction.amount;
      } else if (transaction.type === 'expense') {
        summary.totalExpenses += transaction.amount;
      } else if (transaction.type === 'refund') {
        summary.totalRefunds += transaction.amount;
      }

      // Track payment methods
      summary.paymentMethods[transaction.paymentMethod] = 
        (summary.paymentMethods[transaction.paymentMethod] || 0) + transaction.amount;

      // Track categories
      summary.categories[transaction.category] = 
        (summary.categories[transaction.category] || 0) + transaction.amount;
    });

    summary.netIncome = summary.totalSales - summary.totalExpenses - summary.totalRefunds;

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get daily sales report
router.get('/financial/daily-report', async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const transactions = await Transaction.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }).populate('relatedOrder processedBy');

    const report = {
      date: startOfDay,
      totalTransactions: transactions.length,
      sales: {
        total: 0,
        byHour: Array(24).fill(0)
      },
      topSellingItems: {},
      staffPerformance: {}
    };

    transactions.forEach(transaction => {
      if (transaction.type === 'sale') {
        report.sales.total += transaction.amount;
        const hour = new Date(transaction.createdAt).getHours();
        report.sales.byHour[hour] += transaction.amount;

        if (transaction.processedBy) {
          const staffId = transaction.processedBy._id.toString();
          report.staffPerformance[staffId] = report.staffPerformance[staffId] || {
            name: transaction.processedBy.name,
            totalSales: 0,
            transactionCount: 0
          };
          report.staffPerformance[staffId].totalSales += transaction.amount;
          report.staffPerformance[staffId].transactionCount += 1;
        }
      }
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;