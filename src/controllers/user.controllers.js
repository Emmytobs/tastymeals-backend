const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const functions = require('../helper-functions');
const { httpResponseHandler }  = functions;
const pool = require('../../config/db')
// const middleware = require('../middleware')

function userControllers () {

    const getNewAccessToken = (req, res, next) => {
        try {
            // First check to see if there is a refresh token in the auth header
            const authHeader = req.headers['authorization']
            const refreshToken = authHeader && authHeader.replace('Bearer ', '');
            if (!refreshToken) {
                // If there isn't, throw a 401 Unauthorized authentication error
                return httpResponseHandler(res, 401, 'No authentication token provided');
            }
            // Else, verify the refresh token
            const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            if (!payload) {
                // If it's not valid, throw a 403 Forbidden authorization error
                return httpResponseHandler(res, 403, 'Token is invalid');
            }
            // Else, go ahead and create a new access token
            const newAccessToken = jwt.sign({ userId: payload.userId, email: payload.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '45m' });
            return httpResponseHandler(res, 201, 'New access token created', { newAccessToken })
        } catch (error) {
            next(error)
        }
    }

    const login = async (req, res, next) => {
        try {
            const response = await pool.query(
                'SELECT * FROM Users WHERE email=$1',
                [req.body.email]
            )
            if(!response.rows[0]) {
                return httpResponseHandler(res, 404, 'Email/password is incorrect');
            }

            const isAMatch = await bcrypt.compare(req.body.password, response.rows[0].password);
            if (!isAMatch) {
                return httpResponseHandler(res, 404, 'Email/password is incorrect');
            }
            // Generate JWT
            const { userId, email } = response.rows[0];
            const { accessToken, refreshToken } = functions.generateAuthToken({ userId, email });

            return httpResponseHandler(res, 200, "Logged in successfully", { accessToken, refreshToken });
        } catch (error) {
            next(error)
        }
    }

    const registerUser = async (req, res, next) => {
        const { 
            firstname, 
            lastname, 
            email,
            phone,
            type,
            password
        } = req.body;
        try {
            // Customer should only have to fill in their email and password
            if (type === 'CUSTOMER' &&  (!email || !type || !password)) {
                return httpResponseHandler(res, 400, 'Please fill in all the required fields');
            }
            // Restaurant admins must fill in all fields
            if (type === 'RESTAURANT' && 
                    (!firstname || !lastname || !email || !phone || !type || !password)
                ) {
                return httpResponseHandler(res, 400, 'To register as a restaurant admin, please fill in all fields');
            }
            const hashedPassword = await functions.hashPassword(password);
            const response = await pool.query(
                'INSERT INTO Users (firstname, lastname, email, phone, type, password) VALUES($1, $2, $3, $4, $5, $6)',
                [firstname, lastname, email, phone, type, hashedPassword]);

            if (response.rows[0].length) {
                httpResponseHandler(res, 201, 'User account created successfully');
            }
        } catch (error) {
            // error.status = 400; <- Experiment with this to see if you get a non 500 error
            next(error)
        }
    }

    const viewProfile = async (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.replace('Bearer ', '');
        if (!token) {
            return httpResponseHandler(res, 401, 'No authorization token provided');
        }
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!payload) {
            return httpResponseHandler(res, 403, 'Token is invalid');
        }
        const { userId } = payload;
        try {
            const response = await pool.query(
                'SELECT * FROM Users WHERE userId=$1',
                [userId]);
            if (!response.rows[0].length) {
                // List all the possible cases where this condition will be true:
                // 1: User may no longer exist
                return httpResponseHandler(res, 404, '');
            }
            return httpResponseHandler(res, 200, 'User profile fetched successfully', { ...response.rows[0] });
        } catch (error) {
            next(error);
        }

    }

    return {
        getNewAccessToken,
        login,
        registerUser,
        viewProfile
    }
}

module.exports = userControllers();