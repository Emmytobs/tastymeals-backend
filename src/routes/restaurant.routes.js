const { Router } = require('express');
const { restaurantControllers } = require('../controllers');
const middleware = require('../middleware')
const restaurantRouter = Router();

restaurantRouter.get('/restaurants', middleware.authenticateUser, restaurantControllers.getRestaurants)

restaurantRouter.get('/restaurant/:restaurantId', middleware.authenticateUser, restaurantControllers.getASpecificRestaurant)

restaurantRouter.post('/restaurant', middleware.authenticateUser, restaurantControllers.createRestaurant)

restaurantRouter.update('/restaurant', middleware.authenticateUser, restaurantControllers.updateRestaurant)

restaurantRouter.delete('/restaurant', middleware.authenticateUser, restaurantControllers.deleteRestaurant)

module.exports = restaurantRouter;