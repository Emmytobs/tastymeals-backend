const express = require('express');
const { authenticateUser } = require('../middleware')
const orderRouter = express.Router();
const { orderControllers } = require('../controllers')

orderRouter.get('/', authenticateUser, orderControllers.getOrders);
orderRouter.get('/admin', authenticateUser, orderControllers.getOrdersForAdmin);

orderRouter.get('/:orderId', authenticateUser, orderControllers.getASpecificOrder);
orderRouter.get('/admin/:orderId', authenticateUser, orderControllers.getASpecificOrderForAdmin);

orderRouter.post('/', authenticateUser, orderControllers.createOrder);

orderRouter.put('/', authenticateUser, orderControllers.updateOrder);

orderRouter.delete('/', authenticateUser, orderControllers.deleteOrder);

module.exports = orderRouter;