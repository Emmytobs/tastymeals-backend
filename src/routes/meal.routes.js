const { Router } = require('express');
const { mealControllers } = require('../controllers');
const middleware = require('../middleware')
const mealRouter = Router();

mealRouter.get('/special-offers', middleware.authenticateUser, mealControllers.getSpecialOffers)

mealRouter.get('/meals', middleware.authenticateUser, mealControllers.getNewMeals)

mealRouter.get('/:mealId', middleware.authenticateUser, mealControllers.getASpecificMeal)

mealRouter.post('/', middleware.authenticateUser, mealControllers.createMeal)

mealRouter.put('/:mealId', middleware.authenticateUser, mealControllers.updateMeal)

mealRouter.delete('/:mealId', middleware.authenticateUser, mealControllers.deleteMeal);

module.exports = mealRouter;