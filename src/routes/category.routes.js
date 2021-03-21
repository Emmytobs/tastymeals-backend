const categoryRouter = require('express').Router();
const { categoryControllers } = require('../controllers');
const { authenticateUser } = require('../middleware')

categoryRouter.get('/', authenticateUser, categoryControllers.getFoodCategories);

module.exports = categoryRouter;