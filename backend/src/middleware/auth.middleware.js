const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/response');

// Validate JWT_SECRET is configured
if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in environment variables');
    process.exit(1);
}

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
        // Fallback to token in query parameter (useful for authenticated downloads in new tabs)
        token = req.query.token;
    }

    // Make sure token exists
    if (!token) {
        return sendError(res, 'Not authorized to access this route', 401);
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);

        next();
    } catch (error) {
        return sendError(res, 'Not authorized to access this route', 401);
    }
};

// Grant access to specific roles
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return sendError(
                res,
                `User role ${req.user.role} is not authorized to access this route`,
                403
            );
        }
        next();
    };
};

// Optional auth - sets req.user if token provided, but doesn't block if not
// Useful for routes that work for both guests and logged-in users (e.g., recommendations)
exports.optionalAuth = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    // No token - continue as guest (req.user will be undefined)
    if (!token) {
        return next();
    }

    try {
        // Verify token and set user
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (error) {
        // Invalid token - continue as guest (don't block)
        next();
    }
};
