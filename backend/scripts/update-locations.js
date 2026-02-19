const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const Car = require('../src/models/Car');
const Booking = require('../src/models/Booking');

const updateLocations = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        const targetLocation = 'Eastleigh 12nd St, Sec 2';

        // Update all cars
        const carUpdate = await Car.updateMany({}, { location: targetLocation });
        console.log(`Updated ${carUpdate.modifiedCount} cars to location: ${targetLocation}`);

        // Update all bookings
        const bookingUpdate = await Booking.updateMany({}, {
            pickupLocation: targetLocation,
            returnLocation: targetLocation
        });
        console.log(`Updated ${bookingUpdate.modifiedCount} bookings to location: ${targetLocation}`);

        console.log('Update successful!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

updateLocations();
