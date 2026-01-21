const Joi = require('joi');

const bookingCreateSchema = Joi.object({
    carId: Joi.string().required().messages({
        'string.empty': 'Car ID is required'
    }),
    customerName: Joi.string().required().messages({
        'string.empty': 'Customer name is required'
    }),
    customerEmail: Joi.string().email().required().messages({
        'string.email': 'Valid customer email is required'
    }),
    customerPhone: Joi.string().required().messages({
        'string.empty': 'Customer phone number is required'
    }),
    pickupDate: Joi.date().iso().required().messages({
        'date.base': 'Valid pickup date is required'
    }),
    returnDate: Joi.date().iso().min(Joi.ref('pickupDate')).required().messages({
        'date.min': 'Return date must be after pickup date'
    }),
    pickupLocation: Joi.string().required(),
    returnLocation: Joi.string().required(),
    extras: Joi.array().items(Joi.string()).default([]),
    totalDays: Joi.number().integer().positive().required(),
    totalPrice: Joi.number().positive().required()
});

const bookingStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'active', 'completed', 'cancelled').required()
});

module.exports = {
    bookingCreateSchema,
    bookingStatusSchema
};
