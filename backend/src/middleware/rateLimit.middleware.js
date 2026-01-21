const rateLimit = require('express-rate-limit');

// 1. Global Limiter: 100 requests per 15 minutes for all /api routes
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// 2. Auth Limiter: More strict for login and register (5 attempts per minute)
const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5,
    message: {
        success: false,
        error: 'Too many authentication attempts. Please try again in a minute.'
    }
});

// 3. AI Limiter: Protecting Gemini API resources (10 requests per 30 minutes)
const aiLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 10,
    message: {
        success: false,
        error: 'AI request limit reached. Please wait 30 minutes before asking again.'
    }
});

module.exports = {
    globalLimiter,
    authLimiter,
    aiLimiter
};
