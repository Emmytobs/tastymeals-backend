const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function httpResponseHandler(res, status, message, data=null) {
    function statusBeginsWith(number) {
        status = String(status);
        return status[0] == String(number);
    }
    
    if (statusBeginsWith(4)) {
        res.status = status;
        res.json({
            status: 'error',
            message,
            data
        })
        return;
    }
    res.status = status;
    res.json({
        status: 'success',
        message,
        data
    })
}

const hashPassword = async (password) => {
    const hashedPassword = await bcrypt.hash(password, 8)
    return hashedPassword;
}

const generateAuthToken = (payload) => {
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '45m' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '3d' });
    return { accessToken, refreshToken };
}

const getAuthToken = (req) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.replace('Bearer ', '');
    return token;
}

module.exports = {
    httpResponseHandler,
    hashPassword,
    generateAuthToken,
    getAuthToken
}