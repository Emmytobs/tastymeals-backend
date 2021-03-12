const { Router } = require('express');
const { restaurantControllers } = require('../controllers');
const middleware = require('../middleware')
const restaurantRouter = Router();

restaurantRouter.get('/all', middleware.authenticateUser, restaurantControllers.getRestaurants)

restaurantRouter.get('/admin', middleware.authenticateUser, restaurantControllers.getRestaurantForAdmin)

restaurantRouter.post('/', middleware.authenticateUser, restaurantControllers.createRestaurant)

restaurantRouter.get('/:restaurantId', middleware.authenticateUser, restaurantControllers.getASpecificRestaurant)

restaurantRouter.put('/:restaurantId', middleware.authenticateUser, restaurantControllers.updateRestaurant)

restaurantRouter.delete('/:restaurantId', middleware.authenticateUser, restaurantControllers.deleteRestaurant)

module.exports = restaurantRouter;