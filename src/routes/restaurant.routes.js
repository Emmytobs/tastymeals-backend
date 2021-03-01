const { Router } = require('express');
const { restaurantControllers } = require('../controllers');
const middleware = require('../middleware')
const restaurantRouter = Router();

restaurantRouter.get('/restaurants', middleware.authenticateUser, restaurantControllers.getRestaurants)

restaurantRouter.get('/:restaurantId', middleware.authenticateUser, restaurantControllers.getASpecificRestaurant)

restaurantRouter.post('/', middleware.authenticateUser, restaurantControllers.createRestaurant)

restaurantRouter.put('/', middleware.authenticateUser, restaurantControllers.updateRestaurant)

restaurantRouter.delete('/', middleware.authenticateUser, restaurantControllers.deleteRestaurant)

module.exports = restaurantRouter;