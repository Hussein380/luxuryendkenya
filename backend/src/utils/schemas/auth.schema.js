const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().required().max(50).messages({
        'string.empty': 'Name is required',
        'string.max': 'Name cannot exceed 50 characters'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'string.empty': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.empty': 'Password is required'
    }),
    role: Joi.string().valid('user', 'admin').default('user')
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'string.empty': 'Email is required'
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Password is required'
    })
});

module.exports = {
    registerSchema,
    loginSchema
};
