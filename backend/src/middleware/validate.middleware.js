const { sendError } = require('../utils/response');

/**
 * Middleware to validate request data against a Joi schema
 * @param {Object} schema - Joi schema object
 * @param {String} source - Request object property to validate (body, query, params)
 */
const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[source], {
            abortEarly: false, // Include all errors, not just the first one
            allowUnknown: true, // Allow fields not in schema (like carData.name auto-gen)
            stripUnknown: false // Don't strip unregistered keys for now to avoid breaking existing logic
        });

        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message.replace(/['"]/g, ''))
                .join(', ');

            return sendError(res, errorMessage, 400);
        }

        // Replace request data with validated/sanitized value
        req[source] = value;
        next();
    };
};

module.exports = validate;
