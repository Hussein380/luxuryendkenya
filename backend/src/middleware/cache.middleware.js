const { client } = require('../config/redis.config');
const { sendSuccess } = require('../utils/response');

/**
 * Middleware to cache GET requests
 * @param {Number} ttl - Time to live in seconds (default 1 hour)
 */
const cache = (ttl = 3600) => {
    return async (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // If Redis isn't connected, skip caching
        if (!client.isOpen) {
            return next();
        }

        const key = `driveease:cars:${req.originalUrl}`;

        try {
            const cachedData = await client.get(key);
            if (cachedData) {
                // console.log(`Cache hit for ${key}`);
                return sendSuccess(res, JSON.parse(cachedData));
            }

            // If not in cache, override res.sendSuccess (or the final response) to capture and store it
            // Since we use sendSuccess utility, we can intercept it or just store after controller finishes
            // A common pattern is to wrap res.send

            const originalSend = res.send;
            res.send = function (body) {
                res.send = originalSend;

                // Store in cache if it's a success status
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    client.setEx(key, ttl, body).catch(err => console.error('Cache set error:', err));
                }

                return originalSend.call(this, body);
            };

            next();
        } catch (err) {
            console.error('Cache middleware error:', err);
            next();
        }
    };
};

module.exports = cache;
