require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels(apiKey) {
    try {
        console.log('--- Listing Models (via Fetch) ---');
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        if (data.models) {
            console.log('Available models found:', data.models.map(m => m.name).join(', '));
            return data.models.map(m => m.name.replace('models/', ''));
        } else {
            console.log('No models returned in list call:', data);
        }
    } catch (e) {
        console.error('Error listing models:', e.message);
    }
    return null;
}

const testGemini = async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY not found in .env');
        process.exit(1);
    }

    const availableModels = await listModels(apiKey);

    // Fallback list of common IDs if list call fails
    const testList = availableModels || [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-2.0-flash-exp',
        'gemini-2.0-flash'
    ];

    const genAI = new GoogleGenerativeAI(apiKey);
    const prompt = "Hello, reply with one word: 'Ready'.";

    for (const modelName of testList) {
        try {
            console.log(`\n🤖 Testing model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            console.log(`✅ Success with ${modelName}!`);
            console.log(`Response: ${text.trim()}`);
            process.exit(0);
        } catch (error) {
            console.warn(`⚠️ ${modelName} failed: ${error.message}`);
        }
    }

    console.error('\n❌ All models failed.');
    process.exit(1);
};

testGemini();
