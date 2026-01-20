const testAuth = async () => {
    const baseUrl = 'http://localhost:5000/api/auth';
    const testUser = {
        name: 'Test User',
        email: `test_${Date.now()}@example.com`,
        password: 'password123'
    };

    try {
        console.log('1. Testing Registration...');
        const regRes = await fetch(`${baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });
        const regData = await regRes.json();
        console.log('Registration Response:', JSON.stringify(regData, null, 2));

        if (!regRes.ok) throw new Error('Registration failed');

        console.log('\n2. Testing Login...');
        const loginRes = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password
            })
        });
        const loginData = await loginRes.json();
        console.log('Login Response:', JSON.stringify(loginData, null, 2));

        if (!loginRes.ok) throw new Error('Login failed');

        console.log('\n✅ Auth Test Passed!');
    } catch (error) {
        console.error('\n❌ Auth Test Failed!');
        console.error(error.message);
        process.exit(1);
    }
};

testAuth();
