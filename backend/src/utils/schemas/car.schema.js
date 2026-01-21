const Joi = require('joi');

const carCreateSchema = Joi.object({
    brand: Joi.string().required(),
    model: Joi.string().required(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
    category: Joi.string().valid('economy', 'compact', 'sedan', 'suv', 'luxury', 'sports').required(),
    pricePerDay: Joi.number().positive().required(),
    seats: Joi.number().integer().positive().required(),
    transmission: Joi.string().valid('automatic', 'manual').required(),
    fuelType: Joi.string().valid('petrol', 'diesel', 'electric', 'hybrid').required(),
    location: Joi.string().required(),
    description: Joi.string().required(),
    features: Joi.any(), // Can be string or array due to FormData handling
    available: Joi.boolean().default(true),
    imageUrl: Joi.string().optional() // Provided by multipart/cloudinary
});

const carUpdateSchema = Joi.object({
    brand: Joi.string(),
    model: Joi.string(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1),
    category: Joi.string().valid('economy', 'compact', 'sedan', 'suv', 'luxury', 'sports'),
    pricePerDay: Joi.number().positive(),
    seats: Joi.number().integer().positive(),
    transmission: Joi.string().valid('automatic', 'manual'),
    fuelType: Joi.string().valid('petrol', 'diesel', 'electric', 'hybrid'),
    location: Joi.string(),
    description: Joi.string(),
    features: Joi.any(),
    available: Joi.boolean(),
    imageUrl: Joi.string(),
    name: Joi.string()
});

module.exports = {
    carCreateSchema,
    carUpdateSchema
};
