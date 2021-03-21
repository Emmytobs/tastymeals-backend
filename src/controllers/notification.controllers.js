const pool = require('../../config/db')
const { httpResponseHandler } = require('../helper-functions')

const getNotifications = async (req, res, next) => {
    try {
        const response = await pool.query(
            `
            SELECT * FROM Notifications
            INNER JOIN Orders ON Orders.orderid=Notifications.notification_order_id
            INNER JOIN Meals ON Meals.mealid=Orders.mealid
            WHERE Notifications.notification_user_id=$1
            ORDER BY Notifications.notification_created_at DESC
            `,
            [req.user.userId]
        )
        if (!response.rows.length) {
            return httpResponseHandler.success(res, 200, 'No notifications to show')
        }
        return httpResponseHandler.success(res, 200, 'Notifications fetched successfully', response.rows)
    } catch (error) {
        next(error)
    }
}

const updateNotificationViewedState = async (req, res, next) => {
    try {
        const response = await pool.query(
            'UPDATE Notifications SET notification_viewed=$1 WHERE notification_user_id=$2 RETURNING notification_viewed',
            [true, req.user.userId]
        )
        return httpResponseHandler.success(res, 200, 'Notification has been viewed', response.rows)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getNotifications,
    updateNotificationViewedState
}