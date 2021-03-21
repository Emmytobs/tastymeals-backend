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
                return httpResponseHandler.error(res, 401, 'No authentication token provided');
            }
            // Else, verify the refresh token
            const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            if (!payload) {
                // If it's not valid, throw a 403 Forbidden authorization error
                return httpResponseHandler.error(res, 403, 'Token is invalid');
            }
            // Else, go ahead and create a new access token
            const accessToken = jwt.sign({ userId: payload.userId, email: payload.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '45m' });
            return httpResponseHandler.success(res, 201, 'New access token created', { accessToken })
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
                return httpResponseHandler.error(res, 404, 'Email/password is incorrect');
            }

            const isAMatch = await bcrypt.compare(req.body.password, response.rows[0].password);
            if (!isAMatch) {
                return httpResponseHandler.error(res, 404, 'Email/password is incorrect');
            }
            // Generate JWT
            const { userid: userId, email } = response.rows[0];
            const { accessToken, refreshToken } = functions.generateAuthToken({ userId, email });

            return httpResponseHandler.success(res, 200, "Logged in successfully", { accessToken, refreshToken });
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
                return httpResponseHandler.error(res, 400, 'Please fill in all the required fields');
            }
            // Restaurant admins must fill in all fields
            if (type === 'RESTAURANT_ADMIN' && 
                    (!firstname || !lastname || !email || !phone || !type || !password)
                ) {
                return httpResponseHandler.error(res, 400, 'To register as a restaurant admin, please fill in all fields');
            }
            const hashedPassword = await functions.hashPassword(password);
            await pool.query(
                'INSERT INTO Users (firstname, lastname, email, phone, type, password) VALUES($1, $2, $3, $4, $5, $6) RETURNING *',
                [firstname, lastname, email, phone, type, hashedPassword]);
            // You should be able to handle errors here to output helpful error messages
            return httpResponseHandler.success(res, 201, 'User account created successfully');
        } catch (error) {
            next(error);
        }
    }

    const viewProfile = async (req, res, next) => {
        try {
            delete req.user.password;
            // if (req.user.type === 'RESTAURANT_ADMIN') {
            //     const response = await pool.query(
            //         'SELECT restaurantid FROM Restaurants WHERE admin_user_id=$1',
            //         [req.user.userId]
            //     )
            //     let restaurantProfile = response.rows[0];
            //     return httpResponseHandler.success(res, 200, 'User profile fetched successfully', { ...req.user, restaurantId: restaurantProfile ? restaurantProfile.restaurantid : null });
                
            // }
            return httpResponseHandler.success(res, 200, 'User profile fetched successfully', { ...req.user });
        } catch (error) {
            next(error);
        }

    }

    const updateUser = async (req, res, next) => {
        try {
            const updates = Object.keys(req.body);
            if(!updates.length || !req.body) {
                return httpResponseHandler.error(res, 400, 'No field added to update');
            }

            const allowedUpdates = ['firstname', 'lastname', 'email', 'phone', 'password'];

            const { columnNames, variables } = functions.constructUpdateQuery(res, allowedUpdates, req.body);

            let query = `UPDATE Users SET ${columnNames} WHERE userid=$${updates.length + 1} RETURNING *`;
            
            const updatedUser = await pool.query(query, [...variables, req.user.userId]);
            
            return httpResponseHandler.success(res, 200, 'User data updated succesfully', { ...updatedUser.rows[0] })
        } catch (error) {
            next(error)
        }
    }

    const deleteUser = async (req, res, next) => {
        try {
            const user = await pool.query(
                'DELETE FROM Users WHERE userid=$1 RETURNING *',
                [req.user.userId]
            )
            
            if (!user.rows.length) {
                return httpResponseHandler.success(res, 404, 'User not found');
            }
            return httpResponseHandler.success(res, 200, 'User deleted successfully');
        } catch (error) {
            next(error)
        }
    }

    return {
        getNewAccessToken,
        login,
        registerUser,
        viewProfile,
        updateUser,
        deleteUser
    }
}

module.exports = userControllers();