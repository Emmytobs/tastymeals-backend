const pool = require('../../config/db');
const { constructUpdateQuery } = require('../helper-functions');
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
        if (!response.rows.length) {
            return httpResponseHandler.success(res, 200, 'Looks like there are no new meals', null);
        }
                
        httpResponseHandler.success(res, 200, 'New meals fetched successfully', { ...response.rows[0] });
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
            return httpResponseHandler.error(res, 404, 'Meal not found', null);
        }
        return httpResponseHandler.success(res, 200, 'Meal featched successfully', { ...response.rows[0] });
    } catch (error) {
        next(error)
    }
}

const createMeal = async (req, res, next) => {
    try {
        const existingRestaurantAdmin = await pool.query(
            'SELECT * FROM Users WHERE userid=$1 AND type=$2',
            [req.user.userId, 'RESTAURANT_ADMIN']
        );
        if (!existingRestaurantAdmin.rows.length) {
            // User is not a restaurant admin
            return httpResponseHandler.error(res, 403, 'Unable to create meal. User is not authorized.', null)
        }

        // Search the rows in the restaurants table to check if any row's userId matches the userId in the request object
        const existingRestaurant = await pool.query(
            'SELECT * FROM Restaurants WHERE admin_user_id=$1',
            [req.user.userId]
        );
        // If the user is not an admin, prevent them from creating a meal
        if (!existingRestaurant.rows.length) {
            return httpResponseHandler.error(res, 403, 'Unable to create meal. User is not authorized.', null)
        }

        const {
            name,
            description,
            price,
            image,
            category
        } = req.body;

        const restaurantId = existingRestaurant.rows[0].restaurantid;

        const newMeal = await pool.query(
            'INSERT INTO Meals(name, description, price, image, restaurantid, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, description, price, image, restaurantId, category]
        );
        return httpResponseHandler.success(res, 201, 'Meal created successfully', { ...newMeal.rows[0] })

    } catch(error) {
        next(error)
    }
}  

const updateMeal = async (req, res, next) => {
    const updates = Object.keys(req.body);
    const { mealId } = req.params;

    console.log(req.body)
    if (!updates.length || !req.body) {
        return httpResponseHandler.error(res, 400, 'No field added to update');
    }
    
    try {
        // Check if the meal exists 
        const existingMeal = await pool.query(
            'SELECT * FROM Meals WHERE mealId=$1',
            [mealId]
        );
        if (!existingMeal.rows.length) {
            return httpResponseHandler.error(res, 404, 'Meal not found');
        }

        // Search the restaurants table to see if any restaurant's userId corresponds with that of the logged in user (req.user)
        const existingRestaurantByLoggedInUser = await pool.query(
        'SELECT * FROM Restaurants WHERE admin_user_id=$1',
        [req.user.userId]
        );
        // If the user is not an admin, prevent them from creating a meal
        if (!existingRestaurantByLoggedInUser.rows.length) {
            return httpResponseHandler.error(res, 403, 'Unable to update meal. User is not authorized.', null)
        }

        // If the meal exists and the user is an admin user, check if it was created by the currently logged in user (req.user)
        const existingMealByLoggedInUser = await pool.query(
            `
            SELECT Meals.name, Meals.description, Meals.price, Meals.image
            FROM Meals
            JOIN Restaurants ON Meals.restaurantid = Restaurants.restaurantid
            WHERE Restaurants.admin_user_id = $1 AND Meals.mealid = $2
            `,
            [req.user.userId, mealId]
        );
        if (!existingMealByLoggedInUser.rows.length) {
            return httpResponseHandler.error(res, 403, 'Unable to delete meal. User is not authorized')
        }

        // If it passes through all the checks, go ahead and update the meal
        const allowedUpdates = ['name', 'description', 'price', 'image'];

        const { columnNames, variables } = functions.constructUpdateQuery(res, allowedUpdates, req.body);

        const query = `UPDATE Meals SET ${columnNames} WHERE mealid=$${updates.length + 1} RETURNING *`;

        const updatedMeal = await pool.query(
            query,
            [...variables, mealId]
        )
        return httpResponseHandler.success(res, 200, 'Meal updated successfully', { ...updatedMeal.rows[0] });
        
   } catch(error) {
       next(error)
   }
}

const deleteMeal = async (req, res, next) => {
    const { mealId } = req.params;
    
    try {
       // Check if the meal exists
        const existingMeal = await pool.query(
            'SELECT * FROM Meals WHERE mealId=$1',
            [mealId]
        );
        if (!existingMeal.rows.length) {
            return httpResponseHandler.error(res, 404, 'Meal not found');
        }

        // Search the restaurants table to see if any restaurant's userId corresponds with that of the logged in user (req.user)
        const existingRestaurantByLoggedInUser = await pool.query(
        'SELECT * FROM Restaurants WHERE admin_user_id=$1',
        [req.user.userId]
        );
        // If the user is not an admin, prevent them from creating a meal
        if (!existingRestaurantByLoggedInUser.rows.length) {
            return httpResponseHandler.error(res, 403, 'Unable to update meal. User is not authorized.', null)
        }

        // If the meal exists and the user is an admin user, check if it was created by the currently logged in user (req.user)
        const existingMealByLoggedInUser = await pool.query(
            `
            SELECT * FROM Meals
            JOIN Restaurants ON Meals.restaurantid = Restaurants.restaurantid
            WHERE Restaurants.admin_user_id = $1 AND Meals.mealid = $2
            `,
            [req.user.userId, mealId]
        );
        if (!existingMealByLoggedInUser.rows.length) {
            return httpResponseHandler.error(res, 403, 'Unable to delete meal. User is not authorized')
        }

        await pool.query(
            'DELETE FROM Meals WHERE mealId=$1', 
            [mealId]
        )
       return httpResponseHandler.success(res, 204, 'Meal deleted successfully');
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