const pool = require('../../config/db');
const { httpResponseHandler } = require('../helper-functions');

const verifyIfUserCanRateMeal = async (req, res, next) => {
    const { mealId } = req.params;
    try {
        const response = await pool.query(
            `
            SELECT * FROM Orders WHERE userid=$1 AND mealid=$2
            `,
            [req.user.userId, mealId]
        )        
        if (!response.rows.length) {
            return httpResponseHandler.success(res, 204, 'You can rate this meal once you order it')
        }
        return httpResponseHandler.success(res, 200, 'You have ordered this meal')
    } catch (error) {
        next(error)
    }
}

const createMealRating = async (req, res, next) => {
    const { rating, review=null, mealId } = req.body;
    try {
        // Check if the logged in user has ordered the meal
        const response = await pool.query(
            // This query will fetch all the orders made by the user for the specific meal
            // We want the query to stop once there is one record of the meal ordered by the user. 
            // Please fix this
            `
            SELECT * FROM Orders
            WHERE userid=$1 AND mealid=$2
            `,
            [req.user.userId, mealId]
            )
        // If not, refuse the request
        if (!response.rows.length) {
            return httpResponseHandler.error(res, 403, 'You can rate this meal once you order it')
        }
        
        // ELse, create a meal rating
        const mealRating = await pool.query(
            `
            INSERT INTO MealRatings (rating, review, userid, mealid)
            VALUES ($1, $2, $3, $4) RETURNING *
            `,
            [rating, review, req.user.userId, mealId]
        )
        await pool.query(
            `
            UPDATE Meals SET average_rating = 
            (
                SELECT TRUNC(AVG(rating), 1) FROM MealRatings
                WHERE mealid=$1
            ), rating_count =
            (
                SELECT COUNT(rating) FROM MealRatings
                WHERE mealid=$1
            )
            WHERE mealid=$1
            `,
            [mealId]
        );

        return httpResponseHandler.success(res, 201, 'Meal rating created successfully', { ...mealRating.rows[0] })
    } catch (error) {
        next(error)
    }
}
const createRestaurantRating = async (req, res, next) => {
    const { rating, review=null, restaurantId } = req.body;
    try {
        // Check if the logged in user has ordered the meal
        const response = await pool.query(
            // This query will fetch all the orders made by the user to the specific restaurant
            // We want the query to stop once there is one record of the restaurant where the user had placed an order
            // Please fix this for performance consideration
            `
            SELECT * FROM Orders
            WHERE userid=$1 AND restaurantid=$2
            `,
            [req.user.userId, restaurantId]
        )
        // If not, refuse the request
        if (!response.rows.length) {
            return httpResponseHandler.error(res, 403, 'You can rate this meal once you order it')
        }

        // ELse, create a restaurant rating
        const restaurantRating = await pool.query(
            `
            INSERT INTO RestaurantRatings (rating, review, userid, restaurantid)
            VALUES ($1, $2, $3, $4) RETURNING *
            `,
            [rating, review, req.user.userId, restaurantId]
        )

        await pool.query(
            `
            UPDATE Restaurants SET average_rating = 
            (
                SELECT TRUNC(AVG(rating), 1) FROM RestaurantRatings
                WHERE restaurantid=$1
            ), rating_count = 
            (
                SELECT COUNT(rating) FROM RestaurantRatings 
                WHERE restaurantid=$1
            )
            WHERE restaurantid=$1
            `,
            [restaurantId]
        )

        return httpResponseHandler.success(res, 201, 'Meal rating created successfully', { ...restaurantRating.rows[0] })
    } catch (error) {
        next(error)
    }
}

const getMealRatings = async (req, res, next) => {
    const { mealId } = req.params;
    try {
        const response = await pool.query(
            `
            SELECT MealRatings.rating, MealRatings.review, MealRatings.createdat, 
            Users.firstname, Users.lastname 
            FROM MealRatings
            JOIN Users ON MealRatings.userid=Users.userid
            WHERE mealid = $1
            `,
            [mealId]
        )
        if (!response.rows.length) {
            return httpResponseHandler.success(res, 200, 'No ratings for this meal yet')
        }
        return httpResponseHandler.success(res, 200, 'Meal ratings fetched successfully', response.rows)
    } catch (error) {
        next(error)
    }
}

const getLoggedInUserMealRating = async (req,res, next) => {
    const { mealId, userId } = req.params;
    try {
        const response = await pool.query(
            `
            SELECT * FROM MealRatings WHERE userid=$1 AND mealid=$2
            `,
            [userId, mealId]
        );
        if (!response.rows.length) {
            return httpResponseHandler.success(res, 204, 'You have not rated this meal')
        }
        return httpResponseHandler.success(res, 200, 'Meal rating by user fetched successfully', response.rows[0])
    } catch (error) {
        next(error)
    }
}

const updateMealRating = async () => {

}
const updateRestaurantRating = async () => {
    
}

const deleteMealRating = async (req, res, next) => {
    const { ratingId } = req.params;
    if (!ratingId) {
        return httpResponseHandler.error(res, 400, 'Rating id must be supplied')
    }
    try {
        const response = await pool.query(
            `
            DELETE FROM MealRatings WHERE ratingid=$1 AND userid=$2
            `,
            [ratingId, req.user.userId]
        )
        if (!response.rows.length) {
            return httpResponseHandler.error(res, 404, 'Rating not found');
        }
        return httpResponseHandler.success(res, 200, 'Meal rating deleted successfully')
    } catch (error) {
        next(error)
    }
}
const deleteRestaurantRating = async (req, res, next) => {
    const { ratingId } = req.params;
    if (!ratingId) {
        return httpResponseHandler.error(res, 400, 'Rating id must be supplied')
    }
    try {
        const response = await pool.query(
            `
            DELETE FROM RestaurantRatings WHERE ratingid=$1 AND userid=$2 RETURNING *
            `,
            [ratingId, req.user.userId]
        )
        if (!response.rows.length) {
            return httpResponseHandler.error(res, 404, 'Rating not found');
        }
        return httpResponseHandler.success(res, 200, 'Restaurant rating deleted successfully')
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createMealRating,
    createRestaurantRating,
    getMealRatings,
    verifyIfUserCanRateMeal,
    getLoggedInUserMealRating,
    updateMealRating,
    updateRestaurantRating,
    deleteMealRating,
    deleteRestaurantRating
}