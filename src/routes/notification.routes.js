const { authenticateUser } = require('../middleware')
const { notificationControllers } = require('../controllers')
const notificationRouter = require('express').Router();

notificationRouter.get('/', authenticateUser, notificationControllers.getNotifications);
notificationRouter.put('/', authenticateUser, notificationControllers.updateNotificationViewedState);

module.exports = notificationRouter;