const express = require('express');
const { getRecommendations, getAIChatResponse, getAIGreeting } = require('../controllers/ai.controller');
const { aiLimiter } = require('../middleware/rateLimit.middleware');
const { optionalAuth } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { chatSchema } = require('../utils/schemas/ai.schema');

const router = express.Router();

// Recommendations: personalized for logged-in users, diverse for guests
// optionalAuth sets req.user if authenticated, but doesn't block guests
router.get('/recommendations', aiLimiter, optionalAuth, getRecommendations);

router.post('/chat', aiLimiter, validate(chatSchema), getAIChatResponse);
router.get('/greeting', aiLimiter, getAIGreeting);

module.exports = router;
