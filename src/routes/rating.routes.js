const express = require('express');
const { authenticateUser } = require('../middleware')
const { ratingControllers } = require('../controllers');
const ratingRouter = express.Router();

ratingRouter.post('/meal', authenticateUser, ratingControllers.createMealRating)
ratingRouter.post('/restaurant', authenticateUser, ratingControllers.createRestaurantRating)

ratingRouter.put('/meal/:ratingId', authenticateUser, ratingControllers.updateMealRating)
ratingRouter.put('/restaurant/:ratingId', authenticateUser, ratingControllers.updateRestaurantRating)

ratingRouter.delete('/meal/:ratingId', authenticateUser, ratingControllers.deleteMealRating)
ratingRouter.delete('/restaurant/:ratingId', authenticateUser, ratingControllers.deleteRestaurantRating)

module.exports = ratingRouter;