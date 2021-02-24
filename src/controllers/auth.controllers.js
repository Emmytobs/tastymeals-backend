const { httpResponseHandler } = require('../helper-functions')
const client = require('../../config/db')

function authControllers () {

    const login = (req, res, next) => {
        
    }

    const registerUser = async (req, res, next) => {
        // const { email, password } = req.body;
        // try {
            
        // } catch (error) {
        //     // error.status = 400; <- Experiment with this to see if you get a non 500 error
        //     next(error)
        // }
    }

    const registerRestaurant = (req, res, next) => {

    }

    return {
        login,
        registerUser,
        registerRestaurant
    }
}

module.exports = authControllers();