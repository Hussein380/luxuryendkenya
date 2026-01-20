const Car = require('../models/Car');
const Location = require('../models/Location');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Get car recommendations based on various factors
 */
exports.getRecommendations = async (criteria = {}) => {
    const { category, priceMax, limit = 4 } = criteria;

    let query = { available: true };

    if (category) {
        query.category = category;
    }

    if (priceMax) {
        query.pricePerDay = { $lte: priceMax };
    }

    return await Car.find(query)
        .sort('-rating')
        .limit(limit);
};

/**
 * Internal helper to fetch current fleet context for the AI
 */
const getFleetContext = async () => {
    try {
        const [categories, locations, priceStats, sampleCars] = await Promise.all([
            Car.distinct('category'),
            Location.find({ isActive: true }).select('name'),
            Car.aggregate([
                { $match: { available: true } },
                { $group: { _id: null, minPrice: { $min: '$pricePerDay' }, maxPrice: { $max: '$pricePerDay' } } }
            ]),
            Car.find({ available: true }).select('name brand model category pricePerDay year').limit(10)
        ]);

        const locationNames = locations.length > 0 ? locations.map(l => l.name) : ['Downtown', 'Airport', 'Suburb'];
        const minPrice = priceStats[0] ? priceStats[0].minPrice : 45;

        const carSummary = sampleCars.map(c => `${c.brand} ${c.model} (${c.category}, $${c.pricePerDay}/day)`).join(', ');

        return {
            categories: categories.join(', '),
            locations: locationNames.join(', '),
            priceRange: `$${minPrice} - $${priceStats[0]?.maxPrice || 'any'}`,
            availableCars: carSummary
        };
    } catch (error) {
        console.error('Error fetching fleet context:', error);
        return null;
    }
};

/**
 * Get AI Chat response using Gemini with hierarchical fallback and DYNAMIC context
 */
exports.getAIChatResponse = async (userMessage) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured in .env');
    }

    // 1. Fetch Real Data from DB to inform the AI
    const context = await getFleetContext();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const models = ['models/gemini-2.0-flash', 'models/gemini-1.5-flash', 'models/gemini-1.5-pro', 'models/gemma-3-1b-it'];

    const systemInstruction = `
    You are the DriveEase AI Assistant, a helpful car rental expert. 
    IMPORTANT: You must only provide information that is ACCURATE based on our current database.
    
    Current Real-Time Fleet Data:
    - Available Categories: ${context?.categories || 'Sedan, SUV, Luxury'}
    - Available Locations: ${context?.locations || 'Downtown, Airport'}
    - Price Range: Starting from ${context?.priceRange || '$45/day'}
    - Some specific cars we currently have: ${context?.availableCars || 'Reliable local fleet'}
    
    Guidelines:
    - If a user asks for a car type or specific model we DON'T have in the list above, politely inform them we don't have it currently but suggest the closest alternative from our "Available Categories".
    - Be professional, friendly, and helpful.
    - Always encourage them to use our "Fleet" search for the most up-to-date availability.
    - If you are unsure about a specific detail not in the context, guide the user to contact support or check the booking form.
  `;

    let lastError = null;

    for (const modelName of models) {
        try {
            console.log(`🤖 Attempting DYNAMIC AI response with ${modelName}...`);

            const isGemma = modelName.includes('gemma');
            const modelOptions = { model: modelName };

            // Gemma doesn't support systemInstruction in the current SDK/API version
            // So we prepend it to the message for Gemma, and use the feature for Gemini
            if (!isGemma) {
                modelOptions.systemInstruction = systemInstruction;
            }

            const model = genAI.getGenerativeModel(modelOptions);

            const prompt = isGemma
                ? `Instructions: ${systemInstruction}\n\nUser Question: ${userMessage}`
                : userMessage;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (text) {
                console.log(`✅ Success with ${modelName}`);
                return text;
            }
        } catch (error) {
            console.warn(`⚠️ ${modelName} failed or unavailable: ${error.message}`);
            lastError = error;
        }
    }

    console.error('❌ All Gemini models failed.');
    throw new Error(`The AI assistant is temporarily unavailable: ${lastError ? lastError.message : 'Unknown error'}`);
};
