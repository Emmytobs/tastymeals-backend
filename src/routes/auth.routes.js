const express = require('express');
const authRouter = express.Router();

const { authControllers } = require('../controllers');

authRouter.get('/auth', authControllers.login)


module.exports = authRouter;