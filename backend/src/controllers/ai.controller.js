const recommendationService = require('../services/recommendation.service');
const { sendSuccess, sendError } = require('../utils/response');

// @desc    Get car recommendations
// @route   GET /api/recommendations
// @access  Public
exports.getRecommendations = async (req, res) => {
    try {
        const { category, priceMax, limit } = req.query;
        const recommendations = await recommendationService.getRecommendations({
            category,
            priceMax: priceMax ? parseFloat(priceMax) : undefined,
            limit: limit ? parseInt(limit) : undefined
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
        const { message } = req.body;

        if (!message) {
            return sendError(res, 'Please provide a message', 400);
        }

        const response = await recommendationService.getAIChatResponse(message);

        sendSuccess(res, { response });
    } catch (error) {
        sendError(res, error.message, 500);
    }
};
