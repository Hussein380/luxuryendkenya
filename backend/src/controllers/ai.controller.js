const recommendationService = require('../services/recommendation.service');
const { sendSuccess, sendError } = require('../utils/response');

// @desc    Get car recommendations (personalized for logged-in users, diverse for guests)
// @route   GET /api/ai/recommendations
// @access  Public (but personalized if authenticated)
exports.getRecommendations = async (req, res) => {
    try {
        const { limit } = req.query;

        // req.user is set by optional auth middleware if user is logged in
        const recommendations = await recommendationService.getRecommendations({
            user: req.user || null,
            limit: limit ? parseInt(limit) : 4
        });

        sendSuccess(res, recommendations);
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Get AI Chat response
// @route   POST /api/ai/chat
// @access  Public
exports.getAIChatResponse = async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return sendError(res, 'Please provide a message', 400);
        }

        const response = await recommendationService.getAIChatResponse(message, history || []);

        sendSuccess(res, { response });
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Get AI-generated opening greeting
// @route   GET /api/ai/greeting
// @access  Public
exports.getAIGreeting = async (req, res) => {
    try {
        const greeting = await recommendationService.getAIGreeting();
        sendSuccess(res, { response: greeting });
    } catch (error) {
        sendError(res, error.message, 500);
    }
};
