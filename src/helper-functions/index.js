const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const httpResponseHandler = {
    error(res, status, message, data=null) {
        res.status(status);
        res.json({
            status: 'error',
            message,
            data
        })
        return;
    },
    success(res, status, message, data=null) {
        res.status(status);
        res.json({
            status: 'success',
            message,
            data
        })
        return;
    }
}

const hashPassword = async (password) => {
    const hashedPassword = await bcrypt.hash(password, 8)
    return hashedPassword;
}

const generateAuthToken = (payload) => {
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '3d' });
    return { accessToken, refreshToken };
}

const getAuthToken = (req) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.replace('Bearer ', '');
    return token;
}


const constructUpdateQuery = (res, allowedUpdates, requestBody) => {
    const updates = Object.keys(requestBody);

    let variables = [];
    let columnNames = '';

    updates.forEach(async (update, index) => {
        const forbiddenUpdate = !allowedUpdates.includes(update);
        if (forbiddenUpdate) {
            httpResponseHandler.error(res, 403, 'One or more items is forbidden to be updated')
            return;
        }
        
        let hashedPassword = null;
        if(update == 'password') {
            hashedPassword = await hashPassword(requestBody[update]);
            requestBody[update] = hashedPassword;
        }

        const isLastItem = index == updates.length - 1;
        isLastItem ? columnNames += `${update}=$${index + 1}`: columnNames += `${update}=$${index + 1}, `;
        variables.push(requestBody[update]);
    })
    return { columnNames, variables };
}


module.exports = {
    httpResponseHandler,
    hashPassword,
    generateAuthToken,
    getAuthToken,
    constructUpdateQuery
}