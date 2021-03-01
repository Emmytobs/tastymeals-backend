const pool = require('../../config/db');
const functions = require('../helper-functions');
const { httpResponseHandler } = functions;

const getRestaurants = async (req, res, next) => {

}

const getASpecificRestaurant = async (req, res, next) => {
    const { restaurantId } = req.params;
    try {
        const restaurant = await pool.query(
            'SELECT * FROM Restaurants WHERE restaurantid=$1',
            [restaurantId]
        );
        if (!restaurant.rows.length) {
            return httpResponseHandler.error(res, 404, 'Restaurant not found');
        }
        return httpResponseHandler.success(res, 200, 'Restaurant fetched successfully', { ...restaurant.rows[0] });
    } catch (error) {
        next(error);
    }
}

// Works
const createRestaurant = async (req, res, next) => {
    try {
        // Check if user is an restaurant admin
        const isAdminUser = req.user.type === 'RESTAURANT_ADMIN';
        if (!isAdminUser) {
            return httpResponseHandler.error(res, 403, 'User is not a restaurant admin');
        }

        // If user is a restaurant admin, insert restaurant data into the database
        const { name, address, image=null, city, country } = req.body;
        const newRestaurant = await pool.query(
            'INSERT INTO Restaurants (name, address, image, city, country, admin_user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, address, image, city, country, req.user.userId]
        );
        if (newRestaurant.rows.length) {
            return httpResponseHandler.success(res, 201, 'Restaurant added successfully', { ...newRestaurant.rows[0] })
        }

    } catch (error) {
        next(error);
    }
}

// Works
const updateRestaurant = async (req, res, next) => {
    const { restaurantId } = req.params;
    try {
        // Check if restaurant exists
        const restaurantExists = await pool.query(
            'SELECT * FROM Restaurants WHERE restaurantid=$1',
            [restaurantId]
        )
        if (!restaurantExists) {
            return httpResponseHandler.error(res, 404, 'Restaurant not found');
        }

        // Check if user is an admin user
        const isAdminUser = req.user.type == 'RESTAURANT_ADMIN';
        if (!isAdminUser) {
            return httpResponseHandler.error(res, 403, 'User is not a restaurant admin');
        }

        // Check if user created the restaurant
        const restaurantInDB = await pool.query(
            'SELECT * FROM Restaurants WHERE admin_user_id=$1 AND restaurantid=$2',
            [req.user.userId, restaurantId]
        )
        if (!restaurantInDB.rows.length) {
            return httpResponseHandler.error(res, 403, 'User is not authorized. Looks like you did not create this restaurant');
        }

        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'address', 'city', 'country', 'image'];

        const { columnNames, variables } = functions.constructUpdateQuery(res, allowedUpdates, req.body);
        
        const query = `UPDATE Restaurants SET ${columnNames} WHERE restaurantid=$${updates.length + 1} RETURNING *`;
        const updatedRestaurant = await pool.query(query, [...variables, restaurantId]);

        return httpResponseHandler.success(res, 200, 'Restaurant updated successfully', { ...updatedRestaurant.rows[0] });
    } catch (error) {
        next(error)
    }
}

// Works
const deleteRestaurant = async (req, res, next) => {
    const { restaurantId } = req.params;
    try {
         // Check if restaurant exists
         const restaurantExists = await pool.query(
            'SELECT * FROM Restaurants WHERE restaurantid=$1',
            [restaurantId]
        )
        if (!restaurantExists) {
            return httpResponseHandler.error(res, 404, 'Restaurant not found');
        }

        // Check if user is an admin user
        const isAdminUser = req.user.type == 'RESTAURANT_ADMIN';
        if (!isAdminUser) {
            return httpResponseHandler.error(res, 403, 'User is not a restaurant admin');
        }

        // Check if user created the restaurant
        const restaurantInDB = await pool.query(
            'SELECT * FROM Restaurants WHERE admin_user_id=$1 AND restaurantid=$2',
            [req.user.userId, restaurantId]
        )
        if (!restaurantInDB.rows.length) {
            return httpResponseHandler.error(res, 403, 'User is not authorized. Looks like you did not create this restaurant');
        }

        await pool.query(
            'DELETE FROM Restaurants WHERE restaurantid=$1',
            [restaurantId]
        );

        return httpResponseHandler.error(res, 200, 'Restaurant deleted successfully');
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getRestaurants,
    getASpecificRestaurant,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant
}