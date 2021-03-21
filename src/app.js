const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path')

require('dotenv').config({ path: path.resolve('config','.env') });

// Routes
const userRoutes = require('./routes/user.routes');
const mealRoutes = require('./routes/meal.routes');
const restaurantRoutes = require('./routes/restaurant.routes');
const orderRoutes = require('./routes/order.routes');
const ratingRoutes = require('./routes/rating.routes');
const categoryRoutes = require('./routes/category.routes');
const notificationRoutes = require('./routes/notification.routes');

// Middleware
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.use(userRoutes);
app.use('/meal', mealRoutes);
app.use('/restaurant', restaurantRoutes);
app.use('/order', orderRoutes);
app.use('/rating', ratingRoutes);
app.use('/category', categoryRoutes);
app.use('/notification', notificationRoutes);

// Root endpoint (for testing purposes)
app.get('/', (req, res) => {
    res.json('Server Responded')
})

// 404 - Route not found
app.use((req, res, next) => {
    const error = new Error();
    error.status = 404;
    error.message = `No route matches ${req.url} on the server`;
    return next(error);
})

// Global error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        status: 'error',
        message: err.message
    });
    return next();
})

// Server
const port = process.env.PORT || '5000';
app.listen(port, () => {
    console.log('Server listening on port '+ port);
})

// require('crypto').randomBytes(64).toString('hex')