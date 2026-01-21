const baseUrl = 'http://127.0.0.1:5000/api';

const testValidation = async () => {
    console.log('--- Phase: Request Validation Verification ---');

    // 1. Test Auth Validation (Missing password)
    console.log('\n1. Testing Auth Validation (Missing password)...');
    try {
        const res = await fetch(`${baseUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test User', email: 'test@example.com' })
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`);
        console.log(`Error: ${data.error}`);
    } catch (e) {
        console.log('Fetch failed', e.message);
    }

    // 2. Test Car Validation (Invalid category)
    console.log('\n2. Testing Car Validation (Invalid category)...');
    // Note: This requires admin token, but we are just testing if it reaches validation first
    try {
        const res = await fetch(`${baseUrl}/cars`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ brand: 'Tesla', model: '3', category: 'spaceship' })
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`);
        console.log(`Error: ${data.error}`);
    } catch (e) {
        console.log('Fetch failed', e.message);
    }

    // 3. Test Booking Validation (Return date before pickup)
    console.log('\n3. Testing Booking Validation (Return date before pickup)...');
    try {
        const res = await fetch(`${baseUrl}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                carId: '123',
                customerName: 'John',
                customerEmail: 'john@gmail.com',
                customerPhone: '123',
                pickupDate: '2026-01-20',
                returnDate: '2026-01-10',
                totalDays: 2,
                totalPrice: 100,
                pickupLocation: 'A',
                returnLocation: 'B'
            })
        });
        const data = await res.json();
        console.log(`Status: ${res.status}`);
        console.log(`Error: ${data.error}`);
    } catch (e) {
        console.log('Fetch failed', e.message);
    }

    console.log('\n--- Verification Finished ---');
};

testValidation();
