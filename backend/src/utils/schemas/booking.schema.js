const Joi = require('joi');

const bookingCreateSchema = Joi.object({
    carId: Joi.string().required().messages({
        'string.empty': 'Car ID is required'
    }),
    firstName: Joi.string().required().messages({
        'string.empty': 'First name is required'
    }),
    lastName: Joi.string().required().messages({
        'string.empty': 'Last name is required'
    }),
    customerEmail: Joi.string().email().allow(null, '').optional().messages({
        'string.email': 'Valid customer email is required'
    }),
    customerPhone: Joi.string().required().messages({
        'string.empty': 'Customer phone is required'
    }),
    idImageUrl: Joi.string().optional(),
    licenseImageUrl: Joi.string().optional(),
    bookingType: Joi.string().valid('book_now', 'reserve').required(),
    pickupDate: Joi.string().required().messages({
        'string.empty': 'Pickup date is required'
    }),
    returnDate: Joi.string().required().messages({
        'string.empty': 'Return date is required'
    }),
    pickupLocation: Joi.string().required(),
    returnLocation: Joi.string().required(),
    extras: Joi.array().items(Joi.string()).default([])
    // totalDays and totalPrice are computed server-side, not sent by client
});

const bookingStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'reserved', 'confirmed', 'paid', 'cancelled', 'completed').required()
});

module.exports = {
    bookingCreateSchema,
    bookingStatusSchema
};
