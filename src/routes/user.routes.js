const express = require('express');
const middleware = require('../middleware');
const userRouter = express.Router();

const { userControllers } = require('../controllers');

userRouter.post('/user/token', userControllers.getNewAccessToken)

userRouter.post('/user/login', userControllers.login);
userRouter.post('/user/register', userControllers.registerUser);

userRouter.get('/user/me', middleware, userControllers.viewProfile);


module.exports = userRouter;