const jwt = require('jsonwebtoken')
const pool = require('../../config/db');
const { httpResponseHandler } = require('../helper-functions')

const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.replace('Bearer ', '');
        if (!token) {
            return httpResponseHandler.error(res, 401, "No authentication token provided")
        }

        let payload;
        try {
            payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            const error = new Error('Token is invalid');
            error.status = 401;
            next(error);
        }

        // Check the database to see if any user exists with a userid that matches that in the payload
        const user = await pool.query(
            'SELECT * FROM Users WHERE userid=$1',
            [payload.userId]
        )
        if (!user.rows.length) {
            return httpResponseHandler.error(res, 404, "User no longer exists")
        }
        
        const { userid: userId, ...remainingData } = user.rows[0];
        req.user = { userId, ...remainingData };
        
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = {
    authenticateUser    
}