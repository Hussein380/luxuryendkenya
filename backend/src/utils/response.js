const sendResponse = (res, statusCode, success, data = null, message = null, error = null) => {
    const response = {
        success,
        ...(data && { data }),
        ...(message && { message }),
        ...(error && { error }),
        timestamp: new Date().toISOString()
    };
    return res.status(statusCode).json(response);
};

module.exports = {
    sendSuccess: (res, data, message = null, statusCode = 200) => {
        return sendResponse(res, statusCode, true, data, message);
    },
    sendError: (res, error, statusCode = 500) => {
        return sendResponse(res, statusCode, false, null, null, error);
    }
};
