require('dotenv').config();
const mongoose = require('mongoose');
const Car = require('../src/models/Car');
const Location = require('../src/models/Location');
const Category = require('../src/models/Category');

const categories = [
    { slug: 'economy', name: 'Economy', icon: '🚗', sortOrder: 1 },
    { slug: 'compact', name: 'Compact', icon: '🚙', sortOrder: 2 },
    { slug: 'sedan', name: 'Sedan', icon: '🏙️', sortOrder: 3 },
    { slug: 'suv', name: 'SUV', icon: '🏔️', sortOrder: 4 },
    { slug: 'luxury', name: 'Luxury', icon: '✨', sortOrder: 5 },
    { slug: 'sports', name: 'Sports', icon: '🏎️', sortOrder: 6 }
];

const locations = [
    { name: 'Downtown', address: '123 Main St', city: 'Metropolis' },
    { name: 'Airport', address: 'Terminal 1', city: 'Metropolis' },
    { name: 'Suburb', address: '456 Oak Ave', city: 'Metropolis' }
];

const cars = [
    {
        name: 'Tesla Model 3',
        brand: 'Tesla',
        model: 'Model 3',
        year: 2023,
        category: 'luxury',
        pricePerDay: 89,
        imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89',
        seats: 5,
        transmission: 'automatic',
        fuelType: 'electric',
        features: ['Autopilot', 'Premium Audio', 'Glass Roof'],
        location: 'Downtown',
        description: 'The future of driving. Sleek, fast, and electric.',
        rating: 4.9,
        reviewCount: 124
    },
    {
        name: 'BMW X5',
        brand: 'BMW',
        model: 'X5',
        year: 2022,
        category: 'suv',
        pricePerDay: 120,
        imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e',
        seats: 7,
        transmission: 'automatic',
        fuelType: 'diesel',
        features: ['Leather Seats', 'Navigation', 'Sunroof'],
        location: 'Airport',
        description: 'The ultimate luxury SUV for your family trip.',
        rating: 4.8,
        reviewCount: 98
    },
    {
        name: 'Honda Civic',
        brand: 'Honda',
        model: 'Civic',
        year: 2021,
        category: 'sedan',
        pricePerDay: 55,
        imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588',
        seats: 5,
        transmission: 'automatic',
        fuelType: 'petrol',
        features: ['Apple CarPlay', 'Lane Assist', 'Economical'],
        location: 'Suburb',
        description: 'Reliable, comfortable, and perfect for city driving.',
        rating: 4.7,
        reviewCount: 156
    },
    {
        name: 'Ford Mustang',
        brand: 'Ford',
        model: 'Mustang',
        year: 2023,
        category: 'sports',
        pricePerDay: 150,
        imageUrl: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd',
        seats: 4,
        transmission: 'automatic',
        fuelType: 'petrol',
        features: ['Convertible', 'V8 Engine', 'Sport Mode'],
        location: 'Downtown',
        description: 'Experience pure American muscle on the open road.',
        rating: 4.9,
        reviewCount: 56
    }
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        await Category.deleteMany();
        await Location.deleteMany();
        await Car.deleteMany();

        await Category.create(categories);
        console.log('✅ Categories seeded');

        await Location.create(locations);
        console.log('✅ Locations seeded');

        await Car.create(cars);
        console.log('✅ Cars seeded');

        console.log('✅ All data seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
