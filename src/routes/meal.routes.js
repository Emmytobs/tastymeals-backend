const { Router } = require('express');
const { mealControllers } = require('../controllers');
const middleware = require('../middleware')
const mealRouter = Router();

mealRouter.get('/meal/special-offers', middleware.authenticateUser, mealControllers.getSpecialOffers)

mealRouter.get('/meal/new-meals', middleware.authenticateUser, mealControllers.getNewMeals)

mealRouter.get('/meal/:mealId', middleware.authenticateUser, mealControllers.getASpecificMeal)

mealRouter.post('/meal', middleware.authenticateUser, mealControllers.createMeal)

mealRouter.update('/meal/:mealId', middleware.authenticateUser, mealControllers.updateMeal)

mealRouter.delete('/meal/:mealId', middleware.authenticateUser, mealControllers.deleteMeal);

module.exports = mealRouter;