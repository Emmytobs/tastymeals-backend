const pool = require('../../config/db');
const functions = require('../helper-functions');
const { httpResponseHandler } = functions;

const getSpecialOffers = async () => {
    // Find a way for users to get discounted meals   
    // Find a way for admins to put discounts on meals   
}

const getMealsForAdmin = async (req, res, next) => {
    const isAdmin = req.user.type === 'RESTAURANT_ADMIN';
    if (!isAdmin) {
        return httpResponseHandler.error(res, 403, "You are not a restaurant admin");
    }

    const { limit='ALL', offset='0', order_by, q } = req.query;
    const [columnName='mealid', direction='ASC'] = order_by ? order_by.split(':') : [];

    if (q) {
        // Fetch meal by search query 
        try {
            const response = await pool.query(
                `
                SELECT * FROM Meals JOIN Restaurants ON Meals.restaurantid = Restaurants.restaurantid
                WHERE Restaurants.admin_user_id = $1 AND
                (
                mealname ILIKE '%${q}' OR 
                mealname ILIKE '%${q}%' OR
                mealname ILIKE '${q}%' OR
                mealname IN ('${q}')
                )
                ORDER BY ${columnName} ${direction} LIMIT ${limit} OFFSET ${offset}
                `,
                [req.user.userId]
            )
            return httpResponseHandler.success(res, 200, response.rows)
        } catch (error) {
            next(error)
        }
    }

    try {
        const response = await pool.query(
            `
            SELECT * FROM Meals JOIN Restaurants
            ON Meals.restaurantid = Restaurants.restaurantid
            WHERE Restaurants.admin_user_id = $1
            ORDER BY ${columnName} ${direction} LIMIT ${limit} OFFSET ${offset}
            `,
            [req.user.userId]
        )
        if (!response.rows.length) {
            return httpResponseHandler.success(res, 200, 'There are no meals on your profile')
        }
        return httpResponseHandler.success(res, 200, 'Meals fetched successfully', response.rows)
    } catch (error) {
        next(error)
    }
}


const getMealForAdmin = async (req, res, next) => {
    const isAdmin = req.user.type === 'RESTAURANT_ADMIN';
    const { mealId }  = req.params;

    if (!isAdmin) {
        return httpResponseHandler.error(res, 403, "You are not a restaurant admin");
    }

    try {
        const response = await pool.query(
            `
            SELECT * FROM Meals JOIN Restaurants
            ON Meals.restaurantid = Restaurants.restaurantid
            WHERE Restaurants.admin_user_id = $1 AND Meals.mealid = $2
            `,
            [req.user.userId, mealId]
        )
        if (!response.rows.length) {
            return httpResponseHandler.success(res, 404, 'Meal not found')
        }
        return httpResponseHandler.success(res, 200, 'Meal fetched successfully', response.rows)
    } catch (error) {
        next(error)
    }
}

// Used to fetch related meals on the meal details page OR
// Used to fetch all meals by the restaurant on the restaurant details page OR
const getMeals = async (req, res, next) => {
    const { limit='ALL', offset="0", order_by, columnFilter, q } = req.query;
    const [columnName='mealid', direction='asc'] = order_by ? order_by.split(':') : []

    if (q) {
        // Used to fetch meals that match a search query
        try {
            const response = await pool.query(
                `
                SELECT Meals.*, Restaurants.name FROM Meals JOIN Restaurants 
                ON Meals.restaurantid=Restaurants.restaurantid
                WHERE mealname ILIKE '%${q}' OR 
                mealname ILIKE '%${q}%' OR
                mealname ILIKE '${q}%' OR
                mealname IN ('${q}')
                ORDER BY ${columnName} ${direction} LIMIT ${limit} OFFSET ${offset}
                `
            )
            if (!response.rows.length) {
                return httpResponseHandler.error(res, 404, 'No meals match your search term')
            }
            return httpResponseHandler.success(res, 200, 'Meals fetched successfully', response.rows)
        } catch (error) {
            next(error)
        }
    }
    if (columnFilter) {
        const [column, columnValue] = columnFilter.split(':')
        // Used to fetch meals by a specific condition for any column in the meals table
        try {
            const response = await pool.query(
            `
            SELECT * FROM Meals WHERE Meals.${column}=$1
            ORDER BY ${columnName} ${direction} LIMIT ${limit} OFFSET ${offset}
            `,
            [columnValue])
            if (!response.rows.length) {
                return httpResponseHandler.error(res, 404, 'No meals found')
            }
            return httpResponseHandler.success(res, 200, 'Meals fetched successfully', response.rows);
        } catch (error) {
            next(error)
        }
    }
    
    try {
        // Used to fetch all meals with no specific conditions
        const response = await pool.query(
        `
        SELECT Meals.*, Restaurants.name FROM Meals 
        JOIN Restaurants ON Meals.restaurantid=Restaurants.restaurantid
        ORDER BY ${columnName} ${direction} LIMIT ${limit} OFFSET ${offset}
        `
        )
        if (!response.rows.length) {
            return httpResponseHandler.error(res, 404, 'No meals found');
        }
        return httpResponseHandler.success(res, 200, 'Meals fetched successfully', response.rows)
    } catch (error) {
        next(error)
    }
}

const getASpecificMeal = async (req, res, next) => {
    const { mealId } = req.params;
    try {
        const response = await pool.query(
            `
            SELECT * FROM Meals JOIN Restaurants ON Meals.restaurantid=Restaurants.restaurantid WHERE mealId=$1
            `,
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
        const userIsAdmin = req.user.type == 'RESTAURANT_ADMIN';
        if (!userIsAdmin) {
            // User is not a restaurant admin
            return httpResponseHandler.error(res, 403, 'User is not a restaurant admin.', null)
        }

        // Search the rows in the restaurants table to check if any row's userId matches the userId in the request object
        const existingRestaurant = await pool.query(
            'SELECT * FROM Restaurants WHERE admin_user_id=$1',
            [req.user.userId]
        );
        // If the admin user does not have a restaurant yet, prevent them from creating a meal
        if (!existingRestaurant.rows.length) {
            return httpResponseHandler.error(res, 403, 'To add a meal, you need to create a restaurant profile', null)
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
            'INSERT INTO Meals(mealname, description, price, mealimage, restaurantid, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, description, price, image, restaurantId, category]
        );
        const insertedMeal = await pool.query(
            `
            SELECT * FROM Meals
            JOIN Categories ON Meals.category=Categories.categoryid WHERE Meals.mealid=$1
            `,
            [newMeal.rows[0].mealid]
        )
        return httpResponseHandler.success(res, 201, 'Meal created successfully', { ...insertedMeal.rows[0] })

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

        const userIsAdmin = req.user.type == 'RESTAURANT_ADMIN';
        if (!userIsAdmin) {
            // User is not a restaurant admin
            return httpResponseHandler.error(res, 403, 'User is not a restaurant admin.', null)
        }

        // Search the restaurants table to see if any restaurant's userId corresponds with that of the logged in user (req.user)
        const existingRestaurantByLoggedInUser = await pool.query(
        'SELECT * FROM Restaurants WHERE admin_user_id=$1',
        [req.user.userId]
        );
        // If the user is not an admin, prevent them from creating a meal
        if (!existingRestaurantByLoggedInUser.rows.length) {
            return httpResponseHandler.error(res, 403, 'To update a meal, you need to create a retaurant profile.', null)
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
            return httpResponseHandler.error(res, 403, 'You are not authorized. Looks like you did not create this meal')
        }

        // If it passes through all the checks, go ahead and update the meal
        const allowedUpdates = ['mealname', 'description', 'price', 'mealimage'];

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

        const userIsAdmin = req.user.type == 'RESTAURANT_ADMIN';
        if (!userIsAdmin) {
            // User is not a restaurant admin
            return httpResponseHandler.error(res, 403, 'User is not a restaurant admin.', null)
        }

        // Search the restaurants table to see if any restaurant's userId corresponds with that of the logged in user (req.user)
        const existingRestaurantByLoggedInUser = await pool.query(
        'SELECT * FROM Restaurants WHERE admin_user_id=$1',
        [req.user.userId]
        );
        // If the user is not an admin, prevent them from creating a meal
        if (!existingRestaurantByLoggedInUser.rows.length) {
            return httpResponseHandler.error(res, 403, 'To delete a meal, you need to create a retaurant profile.', null)
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
            return httpResponseHandler.error(res, 403, 'You are not authorized. Looks like you did not create this meal.')
        }

        await pool.query(
            'DELETE FROM Meals WHERE mealId=$1', 
            [mealId]
        )
       return httpResponseHandler.success(res, 200, 'Meal deleted successfully');
   } catch(error) {
       next(error)
   }
}

module.exports = {
    getSpecialOffers,
    getMealsForAdmin,
    getMealForAdmin,
    getMeals,
    getASpecificMeal,
    createMeal,
    updateMeal,
    deleteMeal,
}