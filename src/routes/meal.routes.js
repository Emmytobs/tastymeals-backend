const { Router } = require('express');
const { mealControllers } = require('../controllers');
const middleware = require('../middleware')
const mealRouter = Router();

mealRouter.get('/special-offers', middleware.authenticateUser, mealControllers.getSpecialOffers)

mealRouter.get('/admin', middleware.authenticateUser, mealControllers.getMealsForAdmin)

mealRouter.get('/all', middleware.authenticateUser, mealControllers.getNewMeals)

mealRouter.get('/admin/:mealId', middleware.authenticateUser, mealControllers.getMealForAdmin)

mealRouter.post('/', middleware.authenticateUser, mealControllers.createMeal)

mealRouter.get('/:mealId', middleware.authenticateUser, mealControllers.getASpecificMeal)

mealRouter.put('/:mealId', middleware.authenticateUser, mealControllers.updateMeal)

mealRouter.delete('/:mealId', middleware.authenticateUser, mealControllers.deleteMeal);

module.exports = mealRouter;