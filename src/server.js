const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const giftCardRoutes = require('./routes/giftcard.routes');
const app = express();
const marketingRoutes = require('./routes/marketing.routes');
const supplierRoutes = require('./routes/supplier.routes');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
const menuRoutes = require('./routes/menu.routes');
const categoryRoutes = require('./routes/category.routes');
const promotionRoutes = require('./routes/promotion.routes');
const orderRoutes = require('./routes/order.routes');
const reviewRoutes = require('./routes/review.routes');
const tableRoutes = require('./routes/table.routes');
const reservationRoutes = require('./routes/reservation.routes');
const feedbackRoutes = require('./routes/feedback.routes');
const notificationRoutes = require('./routes/notification.routes');
const kitchenRoutes = require('./routes/kitchen.routes');
const staffRoutes = require('./routes/staff.routes');
const financialRoutes = require('./routes/financial.routes');
const loyaltyRoutes = require('./routes/loyalty.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const deliveryRoutes = require('./routes/delivery.routes');
const eventRoutes = require('./routes/event.routes');

app.use('/api', menuRoutes);
app.use('/api', categoryRoutes);    // Add this line
app.use('/api', promotionRoutes);
app.use('/api', orderRoutes);
app.use('/api', reviewRoutes);
app.use('/api', tableRoutes);
app.use('/api', reservationRoutes);
app.use('/api', feedbackRoutes);
app.use('/api', notificationRoutes);
app.use('/api', kitchenRoutes);
app.use('/api', staffRoutes);
app.use('/api', financialRoutes);
app.use('/api', loyaltyRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', deliveryRoutes);
app.use('/api', eventRoutes);
app.use('/api', giftCardRoutes);
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });