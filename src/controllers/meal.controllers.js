const pool = require('../../config/db');
const functions = require('../helper-functions');
const { httpResponseHandler } = functions;

const getSpecialOffers = async (req, res, next) => {
    // Find a way for users to get discounted meals   
    // Find a way for admins to put discounts on meals   
}

const getNewMeals = async (req, res, next) => {
    const { limit, offset } = req.query;
    try {
        const response = await pool.query(
            'SELECT * FROM Meals ORDER BY createdat DESC LIMIT $1 OFFSET $2',
            [limit, offset]
``      );
        if (!response.rows[0]) {
            return httpResponseHandler(res, 200, 'Looks like there are no new meals', null);
        }
                
        httpResponseHandler(res, 200, 'New meals fetched successfully', { ...response.rows[0] });
    } catch (error) {
        next(error)
    }
}

const getASpecificMeal = async (req, res, next) => {
    const { mealId } = req.params;
    try {
        const response = await pool.query(
            'SELECT * FROM Meals WHERE mealId=$1',
            [mealId]
        )
        if (!response.rows[0]) {
            return httpResponseHandler(res, 404, 'Meal not found', null);
        }
        return httpResponseHandler(res, 200, 'Meal featched successfully', { ...response.rows[0] });
    } catch (error) {
        next(error)
    }
}

const createMeal = (req, res, next) => {
    try {
        // Search the restaurants table whwere admin user has the userId in the request object
        const existingRestaurant = pool.query(
            'SELECT * FROM Restaurants WHERE userid=$1',
            [req.user.userId]
        );
        // If the user is not an admin, prevent them from creating a meal
        if (!existingRestaurant.rows[0].length) {
            return httpResonseHandler(res, 403, 'Unable to create meal. User is not authorized.', null)
        }

        const {
            name,
            description,
            price,
            image
        } = req.body;

        const restaurantId = response.rows[0].restaurantid;

        const newMeal = await pool.query(
            'INSERT INTO Meals(name, description, price, image, restaurantid) VALUES ($1, $2, $3, $4, $5)',
            [name, description, price, image, restaurantId]
        );
        return httpResponseHandler(res, 201, 'Meal created successfully', { ...newMeal })

    } catch(error) {
        next(error)
    }
}  

const updateMeal = async (req, res, next) => {
    
}

const deleteMeal = async (req, res, next) => {
    const { mealId } = req.params;
    
    try {
        // Check if the meal exists 
        const existingMeal = await pool.query(
            'SELECT * FROM Meals WHERE mealId=$1',
            [mealId]
        );
        if (!existingMeal.rows[0].length) {
            return httpResponseHandler(res, 404, 'Meal not found');
        }

        // Search the restaurants table to see if any restaurant's userId corresponds with that of the logged in user (req.user)
        const existingRestaurantByLoggedInUser = pool.query(
        'SELECT * FROM Restaurants WHERE userid=$1',
        [req.user.userId]
        );
        // If the user is not an admin, prevent them from creating a meal
        if (!existingRestaurantByLoggedInUser.rows[0].length) {
            return httpResonseHandler(res, 403, 'Unable to delete meal. User is not authorized.', null)
        }

        // If the meal exists, check if it was created by the currently logged in user (req.user)
        const existingMealByLoggedInUser = await pool.query(
            'SELECT * FROM Meals WHERE userId=$1 AND mealId=$2',
            [req.user.userId, mealId]
        );
        if (!existingMealByLoggedInUser.rows[0].length) {
            return httpResponseHandler(res, 403, 'Unable to delete meal. User is not authorized')
        }

        await pool.query(
            'DELETE FROM Meals WHERE mealId=$1', 
            [mealId]
        )
       return httpResponseHandler(res, 204, 'Meal deleted successfully');
   } catch(error) {
       next(error)
   }
}

module.exports = {
    getSpecialOffers,
    getNewMeals,
    getASpecificMeal,
    createMeal,
    updateMeal,
    deleteMeal,
}