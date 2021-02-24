function httpResponseHandler(res, status, message) {
    function statusBeginsWith(number) {
        status = String(status);
        return status[0] == String(number);
    }
    
    if (statusBeginsWith(4)) {
        res.status = status;
        res.json({
            status: 'error',
            message
        })
        return;
    }
    res.status = status;
    res.json({
        status: 'success',
        message
    })
}

module.exports = httpResponseHandler;