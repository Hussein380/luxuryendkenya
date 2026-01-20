const express = require('express');
const { getRecommendations, getAIChatResponse } = require('../controllers/ai.controller');

const router = express.Router();

router.get('/recommendations', getRecommendations);
router.post('/chat', getAIChatResponse);

module.exports = router;
