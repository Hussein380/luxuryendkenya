const testAI = async () => {
    const baseUrl = 'http://localhost:5000/api/ai';

    try {
        console.log('1. Testing GET /api/ai/recommendations...');
        const resRec = await fetch(`${baseUrl}/recommendations?limit=2`);
        const dataRec = await resRec.json();
        console.log(`Found ${dataRec.data.length} recommendations.`);
        if (dataRec.data.length === 0) throw new Error('No recommendations found');

        console.log('\n2. Testing POST /api/ai/chat (General Hello)...');
        const resChat1 = await fetch(`${baseUrl}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Hello!' })
        });
        const dataChat1 = await resChat1.json();

        if (!dataChat1.data || !dataChat1.data.response) {
            console.error('Unexpected response structure (Hello):', dataChat1);
            throw new Error('Chat failed - missing response data');
        }

        console.log('Response:', dataChat1.data.response.substring(0, 100) + '...');
        if (dataChat1.data.response.length < 5) throw new Error('Chat failed - response too short');

        console.log('\n3. Testing POST /api/ai/chat (Pricing Query)...');
        const resChat2 = await fetch(`${baseUrl}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'How much does it cost to rent a car?' })
        });
        const dataChat2 = await resChat2.json();

        if (!dataChat2.data || !dataChat2.data.response) {
            console.error('Unexpected response structure (Pricing):', dataChat2);
            throw new Error('Chat failed - missing response data');
        }

        console.log('Response:', dataChat2.data.response.substring(0, 100) + '...');

        console.log('\n✅ AI & Recommendations Tests Passed!');
    } catch (error) {
        console.error('\n❌ AI & Recommendations Tests Failed!');
        console.error(error.message);
        process.exit(1);
    }
};

testAI();
