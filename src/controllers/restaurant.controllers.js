const pool = require('../../config/db');
const { httpResponseHandler } = require('../helper-functions');

const getRestaurants = async (req, res, next) => {

}

const getASpecificRestaurant = async (req, res, next) => {

}

const createRestaurant = async (req, res, next) => {
    try {
        // Check if user is an restaurant admin
        const existingRestaurantAdmin = await pool.query(
            'SELECT * FROM Users WHERE userid=$1 AND type=$2',
            [req.user.userId, 'RESTAURANT_ADMIN']
        )
        if (!existingRestaurantAdmin.rows.length) {
            // If user is not an admin, throw a forbidden error
            return httpResponseHandler.error(res, 403, 'Unable to create a restaurant. User is not authorized');
        }
        
        // If user is a restaurant admin, insert restaurant data into the database
        const { name, address, image=null, city, country } = req.body;
        const newRestaurant = await pool.query(
            'INSERT INTO Restaurants (name, address, image, city, country, userid) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, address, image, city, country, existingRestaurantAdmin.rows[0].userid]
        );
        if (newRestaurant.rows.length) {
            return httpResponseHandler.success(res, 201, 'Restaurant added successfully', { ...newRestaurant.rows[0] })
        }

    } catch (error) {
        next(error);
    }
}

const updateRestaurant = async (req, res, next) => {

}

const deleteRestaurant = async (req, res, next) => {

}

module.exports = {
    getRestaurants,
    getASpecificRestaurant,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant
}