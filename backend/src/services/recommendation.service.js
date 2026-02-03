const Car = require('../models/Car');
const Booking = require('../models/Booking');
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
    companyName: 'Sol Travel Group',
    location: 'Nairobi, Kenya',
    phone: '+254 722 235 748',
    phoneRaw: '254722235748',
    email: 'soltravelgroupltd@gmail.com',
    whatsappLink: 'https://wa.me/254722235748',
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
 * Get AI Chat response using Gemini with hierarchical fallback and DYNAMIC context
 */
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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const models = ['models/gemini-2.0-flash', 'models/gemini-1.5-flash', 'models/gemini-1.5-pro', 'models/gemma-3-1b-it'];

    const systemInstruction = `
    Identity: You are the Sol Travel AI Assistant, a friendly car rental expert for ${context?.companyName || 'Sol Travel Group'} in ${context?.location || 'Nairobi, Kenya'}.
    
    CRITICAL RESTRICTION: You ONLY handle car rentals. 
    - If a user asks about anything else (houses, girls, jobs, food, politics, etc.), politely explain that you are specialized ONLY in car rentals and cannot assist with other topics. 
    - Never try to "adapt" your car info to other topics (e.g., do not talk about "Luxury Houses" or "Safari Houses" if asked about house rentals).
    
    Interaction Rules:
    1. GREETINGS & PERSONALITY: 
       - If there is NO history (this is the first message), introduce yourself naturally (e.g., "Hi! I'm your Sol Travel assistant...").
       - If there IS history, DO NOT introduce yourself or say "Hi there! Welcome to Sol Travel" again. Just answer the question directly and stay in the flow of conversation.
       - Use a friendly, professional tone. You can use emojis sparingly to feel more human.
    
    2. SCOPE CONTROL: 
       - You are a CAR RENTAL AI only. 
       - If asked about "houses", "hotels", "flights", "girls", etc., say: "I'd love to help, but I specialize exclusively in car rentals. I can help you find a great vehicle for your stay though! Would you like to see our SUVs or Sedans?"
       - NEVER hallucinate non-car categories.
    
    3. ACCURACY: 
       - When asked for a specific type (e.g., 'SUV', 'Pickup', 'Safari'), ONLY recommend cars from that category in the fleet data below. 
       - If someone asks "how are you?", answer naturally (e.g., "I'm doing great, thanks for asking! Ready to help you find a car.") before getting back to business.
    
    4. COUNTER-QUESTIONS: If a user is vague (e.g., "any cars?"), don't just dump a list. Ask them about their needs (e.g., "Yes! Are you looking for something for city driving, a family trip, or perhaps a safari adventure?").
    
    Real-Time Fleet Data (Source of truth):
    - Categories: ${context?.categories || 'Economy, Compact, Sedan, SUV, Luxury, Safari 4x4, Van, Pickup'}
    - Price Range: ${context?.priceRange || 'Rates starting from approx $35/day'} (Quotes are in KES per day)
    - Pickup Points: ${context?.locations || 'JKIA, Nairobi CBD, Westlands'}
    - Featured Cars: ${context?.availableCars || 'Toyota Vitz, Corolla, RAV4, Prado, Land Cruiser'}
    
    Contact:
    - WhatsApp/Phone: ${context?.phone || '+254 722 235 748'}
    - Email: ${context?.email || 'soltravelgroupltd@gmail.com'}
    
    Formatting:
    - Use plain text. Use • for lists. Keep responses concise but useful.
    `;

    let lastError = null;

    for (const modelName of models) {
        try {
            console.log(`🤖 Attempting AI response with ${modelName} (History items: ${history.length})...`);

            const isGemma = modelName.includes('gemma');
            const modelOptions = { model: modelName };

            if (!isGemma) {
                modelOptions.systemInstruction = systemInstruction;
            }

            const model = genAI.getGenerativeModel(modelOptions);

            // Format history for Gemini API
            // The API expects: [{ role: 'user', parts: [{ text: '...' }] }, { role: 'model', parts: [{ text: '...' }] }]
            const formattedHistory = history.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));

            const chat = model.startChat({
                history: isGemma ? [] : formattedHistory,
                generationConfig: {
                    maxOutputTokens: 500,
                },
            });

            const prompt = isGemma
                ? `Instructions: ${systemInstruction}\n\nConversation History:\n${history.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nUser: ${userMessage}`
                : userMessage;

            const result = await chat.sendMessage(prompt);
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

    console.error('❌ All AI models failed.');
    throw new Error(`The AI assistant is temporarily unavailable: ${lastError ? lastError.message : 'Unknown error'}`);
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

    const greetingPrompt = `You are the Sol Travel car rental assistant. The user has just opened the chat. Reply with exactly one short, friendly greeting sentence (e.g. ask how you can help). No markdown, no lists, no extra text. One sentence only.`;

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
