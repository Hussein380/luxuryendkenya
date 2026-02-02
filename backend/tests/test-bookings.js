const testBookings = async () => {
    const baseUrl = 'http://localhost:5000/api/bookings';
    const carId = '696f6b20ba75c6011baf3d0b';

    const bookingData = {
        carId,
        customerName: 'Booking Tester',
        customerEmail: 'consultancysafehaven@gmail.com',
        customerPhone: '0725996394',
        pickupDate: new Date(Date.now() + 86400000), // Tomorrow
        returnDate: new Date(Date.now() + 86400000 * 3), // +3 days
        pickupLocation: 'Airport',
        returnLocation: 'Downtown',
        extras: ['gps', 'wifi']
    };

    try {
        console.log('1. Testing GET /api/bookings/extras...');
        const resExtras = await fetch(`${baseUrl}/extras`);
        const dataExtras = await resExtras.json();
        console.log('Extras found:', dataExtras.data.length);

        console.log('\n2. Testing POST /api/bookings (Create Booking)...');
        const resCreate = await fetch(`${baseUrl}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        const dataCreate = await resCreate.json();

        if (!resCreate.ok) {
            console.error('Error:', dataCreate.error);
            throw new Error('Booking creation failed');
        }

        console.log('Booking Created! ID:', dataCreate.data.bookingId);
        console.log('Total Days:', dataCreate.data.totalDays);
        console.log('Total Price:', dataCreate.data.totalPrice);

        console.log('\n3. Testing Availability Conflict (Double Booking)...');
        const resConflict = await fetch(`${baseUrl}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });
        const dataConflict = await resConflict.json();

        if (resConflict.status === 400 && dataConflict.error === 'Car is not available for the selected dates') {
            console.log('✅ Availability Conflict caught correctly!');
        } else {
            throw new Error('Conflict check failed');
        }

        console.log('\n✅ All Booking System Tests Passed!');
    } catch (error) {
        console.error('\n❌ Booking System Tests Failed!');
        console.error(error.message);
        process.exit(1);
    }
};

testBookings();
