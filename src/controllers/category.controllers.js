const pool = require('../../config/db');
const { httpResponseHandler } = require('../helper-functions')

const getFoodCategories = async (req, res, next) => {
    try {
        const response = await pool.query('SELECT * FROM Categories')
        if (!response.rows.length) {
            return httpResponseHandler.success(res, 200, 'No categories available');
        }
        return httpResponseHandler.success(res, 200, 'Categories fetched successfully', response.rows);
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getFoodCategories
}