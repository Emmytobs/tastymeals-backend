const pool = require('../../config/db');
const { httpResponseHandler } = require('../helper-functions');

const getOrdersForAdmin = async (req, res, next) => {
    try {
        const isAdminUser = req.user.type == 'RESTAURANT_ADMIN';
        if (!isAdminUser) {
            return httpResponseHandler.error(res, 403, 'User is not a restaurant admin');
        }

        const response = await pool.query(
            `
            SELECT * FROM Orders JOIN Restaurants
            ON Orders.restaurantid = Restaurants.restaurantid
            WHERE Restaurants.admin_user_id = $1
            `,
            [req.user.userId]
        );
        if (!response.rows.length) {
            return httpResponseHandler.success(res, 200, 'There are no orders to display, yet!')
        }
        return httpResponseHandler.success(res, 200, 'Orders fetched successfully', response.rows)
    } catch (error) {
        next(error)
    }
}

const getASpecificOrderForAdmin = async (req, res, next) => {
    const isAdmin = req.user.type === 'RESTAURANT_ADMIN';
    const { orderId } = req.params;
    
    if (!isAdmin) {
        return httpResponseHandler.error(res, 403, 'You are not a restaurant admin');
    }

    try {
        const response = await pool.query(
            `
            SELECT * FROM Orders JOIN Restaurants 
            ON Orders.restaurantid = Restaurants.restaurantid
            WHERE orderid=$1 AND Restaurants.admin_user_id=$2`,
            [orderId, req.user.userId]
        );
        if (!response.rows.length) {
            return httpResponseHandler.error(res, 404, 'Order not found')
        }
        return httpResponseHandler.success(res, 200, 'Order fetched succesfully', { ...response.rows[0] });
    } catch (error) {
        next(error)
    }

}

const getOrders = async (req, res, next) => {
    try {
        const isCustomer = req.user.type == 'CUSTOMER';
        if (!isCustomer) {
            return httpResponseHandler.error(res, 403, 'User is not a customer');
        }

        const response = await pool.query(
            `
            SELECT * FROM Orders JOIN Restaurants
            ON Orders.restaurantid = Restaurants.restaurantid
            WHERE Orders.userid = $1
            `,
            [req.user.userId]
        );
        if (!response.rows.length) {
            return httpResponseHandler.success(res, 204, 'You have not placed any orders');
        }
        return httpResponseHandler.success(res, 200, 'Orders fetched successfully', response.rows)
    } catch (error) {
        next(error)
    }
}

const getASpecificOrder = async (req, res, next) => {
    const { orderId } = req.params;
    try {
        const response = await pool.query(
            'SELECT * FROM Orders WHERE orderid=$1 AND userid=$2',
            [orderId, req.user.userId]
        );
        if (!response.rows.length) {
            return httpResponseHandler.error(res, 404, 'Order not found')
        }
        return httpResponseHandler.success(res, 200, 'Order fetched successfully', { ...response.rows[0] })
    } catch (error) {
        next(error)
    }


}

const createOrder = async (req, res, next) => {
    const { mealId, restaurantId } = req.body;
    try {
        const response = await pool.query(
            'INSERT INTO Orders (mealid, restaurantid, userid) VALUES($1, $2, $3) RETURNING *',
            [mealId, restaurantId, req.user.userId]
        );

        return httpResponseHandler.success(res, 201, 'Order created successfully', response.rows[0])
    } catch (error) {
        next(error)
    }
}

const updateOrder = async () => {

}

const deleteOrder = async () => {

}

module.exports = {
    getOrders,
    getOrdersForAdmin,
    getASpecificOrderForAdmin,
    getASpecificOrder,
    createOrder,
    updateOrder,
    deleteOrder
}