const express = require('express');
const middleware = require('../middleware');
const userRouter = express.Router();

const { userControllers } = require('../controllers');

userRouter.post('/user/login', userControllers.login);
userRouter.post('/user/register', userControllers.registerUser);

userRouter.get('/user/token', userControllers.getNewAccessToken)
userRouter.get('/user/me', middleware.authenticateUser, userControllers.viewProfile);

userRouter.put('/user', middleware.authenticateUser, userControllers.updateUser);

userRouter.delete('/user', middleware.authenticateUser, userControllers.deleteUser)

module.exports = userRouter;