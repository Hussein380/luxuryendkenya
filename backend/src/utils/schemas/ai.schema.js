const Joi = require('joi');

const chatSchema = Joi.object({
    message: Joi.string().required().min(1).max(1000).messages({
        'string.empty': 'Please provide a message',
        'string.min': 'Message cannot be empty',
        'string.max': 'Message is too long (max 1000 characters)'
    })
});

module.exports = {
    chatSchema
};
