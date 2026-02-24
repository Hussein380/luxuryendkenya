const Car = require('../models/Car');
const Booking = require('../models/Booking');
const bookingService = require('./booking.service');
const { NAIROBI_LOCATIONS } = require('../config/locations.config');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Get personalized car recommendations
 * - For logged-in users: based on preferences + booking history
 * - For guests: diverse mix across categories
 * 
 * @param {Object} options
 * @param {Object} options.user - User document (optional, for personalization)
 * @param {Number} options.limit - Max recommendations to return (default 4)
 */
exports.getRecommendations = async ({ user = null, limit = 4 } = {}) => {
    if (user) {
        return await getPersonalizedRecommendations(user, limit);
    }
    return await getDiverseRecommendations(limit);
};

/**
 * Get personalized recommendations for logged-in users
 * Scoring: favorites (+5), preferred categories (+3), booked categories (+2), base rating
 */
async function getPersonalizedRecommendations(user, limit) {
    // 1. Get user's booking history to find category patterns
    const userBookings = await Booking.find({
        user: user._id,
        status: { $in: ['completed', 'confirmed', 'active'] }
    }).populate('car', 'category');

    const bookedCategories = [...new Set(
        userBookings
            .filter(b => b.car?.category)
            .map(b => b.car.category)
    )];

    // 2. Get user's preferred categories and favorites
    const preferredCategories = user.preferredCategorySlugs || [];
    const favoriteIds = user.favorites || [];

    // 3. Combine all preferred categories (explicit + from bookings)
    const allPreferredCategories = [...new Set([...preferredCategories, ...bookedCategories])];

    // 4. Get available cars
    const availableCars = await Car.find({ available: true }).lean();

    // 5. Score each car
    const scoredCars = availableCars.map(car => {
        let score = car.rating || 0; // Base score is the car's rating
        let reason = 'Top rated';

        // +5 if car is in user's favorites
        if (favoriteIds.some(fav => fav.toString() === car._id.toString())) {
            score += 5;
            reason = 'From your favorites';
        }
        // +3 if car is in user's explicitly preferred categories
        else if (preferredCategories.includes(car.category)) {
            score += 3;
            reason = 'Matches your preferences';
        }
        // +2 if car is in a category user has booked before
        else if (bookedCategories.includes(car.category)) {
            score += 2;
            reason = 'Based on your bookings';
        }

        return { ...car, score, reason };
    });

    // 6. Sort by score (desc), then by rating (desc)
    scoredCars.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (b.rating || 0) - (a.rating || 0);
    });

    // 7. Return top recommendations with reason tags
    return scoredCars.slice(0, limit).map(car => ({
        ...car,
        reason: car.reason,
        tags: getRecommendationTags(car, preferredCategories, bookedCategories)
    }));
}

/**
 * Get diverse recommendations for guests (not logged in)
 * Returns one top-rated car from each category for variety
 */
async function getDiverseRecommendations(limit) {
    // 1. Get all distinct categories
    const categories = await Car.distinct('category', { available: true });

    // 2. Get top-rated car from each category
    const carPromises = categories.map(category =>
        Car.findOne({ category, available: true })
            .sort('-rating')
            .lean()
    );

    const carsFromCategories = await Promise.all(carPromises);

    // 3. Filter out nulls and add reason
    let diverseCars = carsFromCategories
        .filter(car => car !== null)
        .map(car => ({
            ...car,
            reason: `Popular in ${car.category.charAt(0).toUpperCase() + car.category.slice(1)}`,
            tags: ['diverse', car.category]
        }));

    // 4. Shuffle for variety (so guests don't see same order every time)
    diverseCars = shuffleArray(diverseCars);

    // 5. If we need more cars to fill limit, add more top-rated
    if (diverseCars.length < limit) {
        const existingIds = diverseCars.map(c => c._id);
        const additionalCars = await Car.find({
            available: true,
            _id: { $nin: existingIds }
        })
            .sort('-rating')
            .limit(limit - diverseCars.length)
            .lean();

        diverseCars = [...diverseCars, ...additionalCars.map(car => ({
            ...car,
            reason: 'Highly rated',
            tags: ['top-rated']
        }))];
    }

    return diverseCars.slice(0, limit);
}

/**
 * Generate tags for a recommendation
 */
function getRecommendationTags(car, preferredCategories, bookedCategories) {
    const tags = [];
    if (car.rating >= 4.5) tags.push('top-rated');
    if (preferredCategories.includes(car.category)) tags.push('preferred');
    if (bookedCategories.includes(car.category)) tags.push('booked-before');
    if (car.isFeatured) tags.push('featured');
    tags.push(car.category);
    return tags;
}

/**
 * Fisher-Yates shuffle for array randomization
 */
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/** Contact and company info for AI context (single source of truth) */
const CONTACT_CONTEXT = {
    companyName: 'luxuryend',
    location: 'Nairobi, Kenya',
    phone: '0725675022',
    phoneRaw: '0725675022',
    email: 'luxuryendkenya@gmail.com',
    whatsappLink: 'https://wa.me/254725675022',
};

/**
 * Internal helper to fetch current fleet context for the AI
 */
const getFleetContext = async () => {
    try {
        const [categories, priceStats, carsByCategory] = await Promise.all([
            Car.distinct('category'),
            Car.aggregate([
                { $match: { available: true } },
                { $group: { _id: null, minPrice: { $min: '$pricePerDay' }, maxPrice: { $max: '$pricePerDay' } } }
            ]),
            // Get 2 sample cars for EACH category
            Car.aggregate([
                { $match: { available: true } },
                { $sort: { rating: -1 } },
                {
                    $group: {
                        _id: '$category',
                        samples: { $push: { name: '$name', brand: '$brand', model: '$model', price: '$pricePerDay' } }
                    }
                },
                {
                    $project: {
                        category: '$_id',
                        samples: { $slice: ['$samples', 2] }
                    }
                }
            ])
        ]);

        const locationNames = NAIROBI_LOCATIONS.join(', ');
        const minPrice = priceStats[0] ? priceStats[0].minPrice : 3200;
        const maxPrice = priceStats[0] ? priceStats[0].maxPrice : 'any';

        // Create a better summary: "Category: Car 1, Car 2"
        const carSummary = carsByCategory.map(cat =>
            `${cat.category.toUpperCase()}: ${cat.samples.map(s => `${s.brand} ${s.model} ($${s.price})`).join(', ')}`
        ).join(' | ');

        return {
            categories: categories.join(', '),
            locations: locationNames,
            priceRange: `KES ${minPrice} - ${maxPrice} per day`,
            availableCars: carSummary,
            ...CONTACT_CONTEXT
        };
    } catch (error) {
        console.error('Error fetching fleet context:', error);
        return { ...CONTACT_CONTEXT };
    }
};

/**
 * Tool definitions for Gemini Function Calling
 */
const tools = [
    {
        functionDeclarations: [
            {
                name: "check_availability",
                description: "Check if a specific car or category is available for a given date range. ALWAYS use this tool when the user asks about availability for specific dates.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        query: {
                            type: "STRING",
                            description: "The car name (e.g. 'Toyota Prado'), brand (e.g. 'Toyota'), or category (e.g. 'SUV', 'Sedan') the user is looking for."
                        },
                        pickupDate: {
                            type: "STRING",
                            description: "The pickup date in ISO 8601 format (YYYY-MM-DD)."
                        },
                        returnDate: {
                            type: "STRING",
                            description: "The return date in ISO 8601 format (YYYY-MM-DD)."
                        }
                    },
                    required: ["query", "pickupDate", "returnDate"]
                }
            }
        ]
    }
];

/**
 * Execute the check_availability tool
 */
async function executeCheckAvailability({ query, pickupDate, returnDate }) {
    console.log(`🛠️ Tool Execution: check_availability('${query}', ${pickupDate}, ${returnDate})`);

    try {
        const pDate = new Date(pickupDate);
        const rDate = new Date(returnDate);

        if (isNaN(pDate.getTime()) || isNaN(rDate.getTime())) {
            return { error: "Invalid date format. Please use YYYY-MM-DD." };
        }

        // 1. Find candidate cars based on the query (name, brand, or category)
        const searchRegex = new RegExp(query, 'i');
        const candidateCars = await Car.find({
            available: true,
            $or: [
                { name: searchRegex },
                { brand: searchRegex },
                { model: searchRegex },
                { category: searchRegex }
            ]
        }).select('name brand model category pricePerDay imageUrl');

        if (candidateCars.length === 0) {
            return {
                available: false,
                message: `No cars found matching "${query}". We have: SUV, Sedan, Economy, Luxury.`
            };
        }

        // 2. Check overlap for each candidate
        const availableCars = [];
        for (const car of candidateCars) {
            const isAvailable = await bookingService.checkCarAvailability(car._id, pDate, rDate);
            if (isAvailable) {
                availableCars.push(car);
            }
        }

        if (availableCars.length === 0) {
            return {
                available: false,
                message: `Sorry, all our ${query}s are fully booked for those dates.`
            };
        }

        // 3. Return top 3 matches
        return {
            available: true,
            count: availableCars.length,
            cars: availableCars.slice(0, 3).map(c => ({
                name: c.name,
                price: c.pricePerDay,
                category: c.category
            }))
        };

    } catch (error) {
        console.error("Tool execution error:", error);
        return { error: "Failed to check availability due to an internal error." };
    }
}

/**
 * Get AI Chat response using Gemini with hierarchical fallback and DYNAMIC context
 * 
 * @param {string} userMessage - The current message from the user
 * @param {Array} history - Optional previous messages [{ role: 'user', content: '...' }, { role: 'assistant', content: '...' }]
 */
exports.getAIChatResponse = async (userMessage, history = []) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured in .env');
    }

    // 1. Fetch Real Data from DB to inform the AI
    const context = await getFleetContext();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: 'v1' });

    // Use a model that supports function calling reliably (Flash 2.0 or 1.5 Pro)
    // Use a model that supports function calling reliably
    const models = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-latest',
        'gemini-1.5-pro',
        'gemini-2.0-flash'
    ];

    const systemInstruction = `
    Identity: You are the luxuryend AI Assistant, a friendly car rental expert.
    
    CAPABILITY: You have access to a tool 'check_availability' that effectively checks the REAL database.
    - IF the user asks "Is X available on date Y?", you MUST call this tool.
    - If the user provides a vague date (e.g. "next Friday"), calculate the ISO date (YYYY-MM-DD) yourself based on the current date (${new Date().toISOString().split('T')[0]}) and call the tool.
    - If the tool returns available cars, present them enthusiastically.
    - If the tool returns no cars, suggest alternatives from the general fleet info.

    General Context:
    - Company: ${context?.companyName || 'Sol Travel'}
    - Fleet Categories: ${context?.categories}
    - Prices: ${context?.priceRange}
    - Location: ${context?.locations}
    `;

    let lastError = null;

    for (const modelName of models) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: {
                    parts: [{ text: systemInstruction }]
                },
                tools: tools
            });

            const formattedHistory = history.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

            const chat = model.startChat({
                history: formattedHistory,
                generationConfig: {
                    maxOutputTokens: 1000,
                },
            });

            const result = await chat.sendMessage(userMessage);
            const response = await result.response;

            const functionCalls = response.functionCalls();

            if (functionCalls && functionCalls.length > 0) {
                const call = functionCalls[0];
                if (call.name === 'check_availability') {
                    const apiResponse = await executeCheckAvailability(call.args);

                    const result2 = await chat.sendMessage([
                        {
                            functionResponse: {
                                name: 'check_availability',
                                response: apiResponse
                            }
                        }
                    ]);

                    return result2.response.text();
                }
            }

            return response.text();

        } catch (error) {
            console.warn(`⚠️ ${modelName} call failed: ${error.message}`);
            lastError = error;
        }
    }

    throw new Error(`AI Service Unavailable: ${lastError ? lastError.message : 'Unknown error'}`);
};


/**
 * Get AI-generated opening greeting (no hardcoded text)
 */
exports.getAIGreeting = async () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured in .env');
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = ['models/gemini-2.0-flash', 'models/gemini-1.5-flash', 'models/gemini-1.5-pro', 'models/gemma-3-1b-it'];

    const greetingPrompt = `You are the luxuryend car rental assistant. The user has just opened the chat. Reply with exactly one short, friendly greeting sentence (e.g. ask how you can help). No markdown, no lists, no extra text. One sentence only.`;

    let lastError = null;
    for (const modelName of models) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(greetingPrompt);
            const response = await result.response;
            const text = response.text()?.trim();
            if (text) return text;
        } catch (error) {
            lastError = error;
        }
    }
    throw new Error(lastError ? lastError.message : 'Could not generate greeting');
};
