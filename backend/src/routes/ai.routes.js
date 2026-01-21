const express = require('express');
const { getRecommendations, getAIChatResponse } = require('../controllers/ai.controller');
const { aiLimiter } = require('../middleware/rateLimit.middleware');
const validate = require('../middleware/validate.middleware');
const { chatSchema } = require('../utils/schemas/ai.schema');

const router = express.Router();

router.get('/recommendations', aiLimiter, getRecommendations);
router.post('/chat', aiLimiter, validate(chatSchema), getAIChatResponse);

module.exports = router;
