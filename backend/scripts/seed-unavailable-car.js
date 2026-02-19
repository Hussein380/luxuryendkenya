const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, '../.env') });

const Car = require('../src/models/Car');
const Booking = require('../src/models/Booking');

const carsData = [
    {
        name: 'Mercedes-Benz G-Wagon',
        brand: 'Mercedes-Benz',
        model: 'G63 AMG',
        year: 2024,
        category: 'luxury',
        pricePerDay: 45000,
        imageUrl: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80&w=800',
        seats: 5,
        transmission: 'automatic',
        fuelType: 'petrol',
        location: 'Westlands',
        description: 'Iconic luxury SUV with unmatched presence and performance.',
        available: false,
        returnInHours: 2
    },
    {
        name: 'Land Rover Defender',
        brand: 'Land Rover',
        model: '110 V8',
        year: 2023,
        category: 'suv',
        pricePerDay: 35000,
        imageUrl: 'https://images.unsplash.com/photo-1610635932087-03e5c7075253?auto=format&fit=crop&q=80&w=800',
        seats: 7,
        transmission: 'automatic',
        fuelType: 'diesel',
        location: 'Karen',
        description: 'Capable off-roader with modern luxury and style.',
        available: false,
        returnInHours: 18
    },
    {
        name: 'Porsche 911 Carrera',
        brand: 'Porsche',
        model: '911',
        year: 2024,
        category: 'sports',
        pricePerDay: 55000,
        imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
        seats: 2,
        transmission: 'automatic',
        fuelType: 'petrol',
        location: 'Jubilee Place',
        description: 'The benchmark of sports cars. Precise, powerful, and timeless.',
        available: false,
        returnInHours: 72
    },
    {
        name: 'Toyota Alphard',
        brand: 'Toyota',
        model: 'Executive Lounge',
        year: 2022,
        category: 'van',
        pricePerDay: 25000,
        imageUrl: 'https://images.unsplash.com/photo-1581458231221-65476d06a92b?auto=format&fit=crop&q=80&w=800',
        seats: 7,
        transmission: 'automatic',
        fuelType: 'hybrid',
        location: 'JKIA',
        description: 'First-class travel on four wheels. Ideal for executive airport transfers.',
        available: false,
        returnInHours: 120
    }
];

const seedTestCars = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected...');

        for (const data of carsData) {
            const { returnInHours, ...carFields } = data;

            // Create Car
            const car = await Car.create(carFields);
            console.log(`Created car: ${car.name}`);

            // Create valid return date
            const returnDate = new Date();
            returnDate.setHours(returnDate.getHours() + returnInHours);

            // Create Booking
            await Booking.create({
                bookingId: 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                car: car._id,
                firstName: 'Test',
                lastName: 'Customer',
                customerPhone: '254700000000',
                pickupDate: new Date(),
                returnDate: returnDate,
                pickupLocation: car.location,
                returnLocation: car.location,
                totalDays: Math.ceil(returnInHours / 24) || 1,
                totalPrice: car.pricePerDay * (Math.ceil(returnInHours / 24) || 1),
                idImageUrl: 'https://via.placeholder.com/150',
                licenseImageUrl: 'https://via.placeholder.com/150',
                bookingType: 'book_now',
                status: 'paid'
            });
            console.log(`- Attached booking returning in ${returnInHours} hours`);
        }

        console.log('\nSeed successful! All 4 cars uploaded with return times.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedTestCars();
