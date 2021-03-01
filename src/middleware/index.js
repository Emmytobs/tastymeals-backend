const jwt = require('jsonwebtoken')
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

        req.user = { userId: payload.userId, email: payload.email };
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = {
    authenticateUser    
}