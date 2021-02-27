const jwt = require('jsonwebtoken')
const { httpResponseHandler } = require('../helper-functions')

const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.replace('Bearer ', '');
        if (!token) {
            return httpResponseHandler(res, 401, "No authentication token provided")
        }
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!payload) {
            return httpResponseHandler(res, 403, "Token is invalid");
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