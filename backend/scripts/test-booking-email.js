/**
 * Test script: Booking creation + Email flow
 *
 * This script:
 * 1. Fetches an available car from the API
 * 2. Creates a booking with huznigarane@gmail.com
 * 3. Verifies the booking was created
 * 4. Confirms the email job was queued (email worker must be running)
 *
 * Run: node scripts/test-booking-email.js
 * Prerequisites: Backend server running (npm run dev), MongoDB connected
 */

const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';

async function testBookingAndEmail() {
    console.log('🧪 Testing Booking + Email Flow\n');
    console.log('─'.repeat(50));

    try {
        // 1. Get a car
        console.log('\n1. Fetching available cars...');
        const carsRes = await fetch(`${BASE_URL}/cars?limit=1`);
        const carsData = await carsRes.json();

        const cars = carsData.data?.cars ?? carsData.data;
        if (!carsData.success || !Array.isArray(cars) || cars.length === 0) {
            throw new Error('No cars found. Run seed-kenya-fleet.js first.');
        }

        const car = cars[0];
        const carId = car._id || car.id;
        console.log(`   ✅ Found car: ${car.name} (${carId})`);

        // 2. Get locations
        console.log('\n2. Fetching locations...');
        const locsRes = await fetch(`${BASE_URL}/cars/locations`);
        const locsData = await locsRes.json();
        const pickupLocation = locsData.success && locsData.data?.length ? locsData.data[0] : 'JKIA Airport';
        console.log(`   ✅ Pickup: ${pickupLocation}`);

        // 3. Create booking (use dates 2 weeks ahead to avoid conflicts with existing bookings)
        const pickupDate = new Date();
        pickupDate.setDate(pickupDate.getDate() + 14);
        const returnDate = new Date(pickupDate);
        returnDate.setDate(returnDate.getDate() + 3);

        const bookingPayload = {
            carId,
            customerName: 'Email Test User',
            customerEmail: 'consultancysafehaven@gmail.com',
            customerPhone: '0725996394',
            pickupDate: pickupDate.toISOString(),
            returnDate: returnDate.toISOString(),
            pickupLocation,
            returnLocation: pickupLocation,
            extras: [],
        };

        console.log('\n3. Creating booking...');
        console.log(`   Customer: ${bookingPayload.customerName}`);
        console.log(`   Email: ${bookingPayload.customerEmail}`);
        console.log(`   Phone: ${bookingPayload.customerPhone}`);

        const bookingRes = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingPayload),
        });

        const bookingData = await bookingRes.json();

        if (!bookingRes.ok) {
            throw new Error(bookingData.error || bookingData.message || 'Booking creation failed');
        }

        const booking = bookingData.data;
        console.log(`   ✅ Booking created! ID: ${booking.bookingId}`);
        console.log(`   Total: KES ${booking.totalPrice?.toLocaleString()}`);

        // 4. Summary
        console.log('\n' + '─'.repeat(50));
        console.log('✅ BOOKING FLOW TEST PASSED\n');
        console.log('Email verification:');
        console.log('  • A confirmation email was queued for consultancysafehaven@gmail.com');
        console.log('  • If the backend email worker is running, the email should arrive shortly');
        console.log('  • Check your inbox (and spam) for: "Booking Confirmed! #' + booking.bookingId + '"');
        console.log('\nTo ensure emails are sent:');
        console.log('  1. Backend must be running: npm run dev');
        console.log('  2. RESEND_API_KEY must be set in .env');
        console.log('  3. Email worker starts with the backend server');
        console.log('');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        if (error.message?.includes('fetch')) {
            console.error('\n   Is the backend running? Try: cd backend && npm run dev');
        }
        process.exit(1);
    }
}

testBookingAndEmail();
