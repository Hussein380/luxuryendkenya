require('dotenv').config();
const mongoose = require('mongoose');
const Car = require('./src/models/Car');
const Category = require('./src/models/Category');
const { NAIROBI_LOCATIONS } = require('./src/config/locations.config');
const { clearCarCache } = require('./src/config/redis.config');

// Categories with Kenyan context
const categories = [
    { slug: 'economy', name: 'Economy', icon: '🚗', sortOrder: 1, isActive: true },
    { slug: 'compact', name: 'Compact', icon: '🚙', sortOrder: 2, isActive: true },
    { slug: 'sedan', name: 'Sedan', icon: '🏙️', sortOrder: 3, isActive: true },
    { slug: 'suv', name: 'SUV', icon: '🏔️', sortOrder: 4, isActive: true },
    { slug: 'luxury', name: 'Luxury', icon: '✨', sortOrder: 5, isActive: true },
    { slug: 'safari', name: 'Safari 4x4', icon: '🦁', sortOrder: 6, isActive: true },
    { slug: 'van', name: 'Van/Minibus', icon: '🚐', sortOrder: 7, isActive: true },
    { slug: 'pickup', name: 'Pickup', icon: '🛻', sortOrder: 8, isActive: true },
];

// Popular cars in Kenya for car hire
const cars = [
    // ECONOMY
    {
        name: 'Toyota Vitz',
        brand: 'Toyota',
        model: 'Vitz',
        year: 2022,
        category: 'economy',
        pricePerDay: 3500,
        imageUrl: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1494976388531-d11e99518c01?w=800&auto=format&fit=crop'
        ],
        seats: 5,
        transmission: 'automatic',
        fuelType: 'petrol',
        features: ['AC', 'USB Charging', 'Bluetooth', 'Fuel Efficient'],
        location: 'JKIA Airport',
        description: 'Perfect for city driving in Nairobi. Fuel efficient and easy to park.',
        available: true,
        rating: 4.5,
        reviewCount: 89
    },
    {
        name: 'Mazda Demio',
        brand: 'Mazda',
        model: 'Demio',
        year: 2021,
        category: 'economy',
        pricePerDay: 3200,
        imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop',
        seats: 5,
        transmission: 'automatic',
        fuelType: 'petrol',
        features: ['AC', 'USB Charging', 'Keyless Entry', 'Fuel Efficient'],
        location: 'Nairobi CBD',
        description: 'Compact and economical. Great for daily commutes and short trips.',
        available: true,
        rating: 4.3,
        reviewCount: 67
    },
    {
        name: 'Honda Fit',
        brand: 'Honda',
        model: 'Fit',
        year: 2022,
        category: 'economy',
        pricePerDay: 3800,
        imageUrl: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop',
        seats: 5,
        transmission: 'automatic',
        fuelType: 'hybrid',
        features: ['AC', 'Hybrid Engine', 'Magic Seats', 'Bluetooth'],
        location: 'Westlands',
        description: 'Hybrid efficiency meets practicality. Surprisingly spacious interior.',
        available: true,
        rating: 4.6,
        reviewCount: 112
    },
    // COMPACT
    {
        name: 'Nissan Note',
        brand: 'Nissan',
        model: 'Note e-Power',
        year: 2023,
        category: 'compact',
        pricePerDay: 4500,
        imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop',
        seats: 5,
        transmission: 'automatic',
        fuelType: 'hybrid',
        features: ['e-Power Hybrid', 'ProPILOT', 'Around View Monitor', 'Apple CarPlay'],
        location: 'JKIA Airport',
        description: 'Modern hybrid technology with excellent fuel economy. Perfect for eco-conscious drivers.',
        available: true,
        rating: 4.7,
        reviewCount: 95
    },
    {
        name: 'Toyota Auris',
        brand: 'Toyota',
        model: 'Auris',
        year: 2021,
        category: 'compact',
        pricePerDay: 4200,
        imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&auto=format&fit=crop',
        seats: 5,
        transmission: 'automatic',
        fuelType: 'petrol',
        features: ['AC', 'Cruise Control', 'Parking Sensors', 'Bluetooth'],
        location: 'Karen',
        description: 'Reliable Toyota quality. Ideal for coastal drives and city exploration.',
        available: true,
        rating: 4.4,
        reviewCount: 78
    },
    // SEDAN
    {
        name: 'Toyota Corolla',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        category: 'sedan',
        pricePerDay: 5500,
        imageUrl: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=800&auto=format&fit=crop',
        seats: 5,
        transmission: 'automatic',
        fuelType: 'petrol',
        features: ['Toyota Safety Sense', 'Lane Assist', 'Adaptive Cruise', 'Apple CarPlay'],
        location: 'Nairobi CBD',
        description: 'The world\'s best-selling car. Reliable, comfortable, and fuel efficient.',
        available: true,
        rating: 4.8,
        reviewCount: 234,
        isFeatured: true,
        featuredRank: 5
    },
    {
        name: 'Toyota Camry',
        brand: 'Toyota',
        model: 'Camry',
        year: 2023,
        category: 'sedan',
        pricePerDay: 7500,
        imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop'
        ],
        seats: 5,
        transmission: 'automatic',
        fuelType: 'hybrid',
        features: ['Hybrid', 'Leather Seats', 'JBL Sound System', 'Wireless Charging'],
        location: 'Westlands',
        description: 'Executive comfort with hybrid efficiency. Perfect for business travel.',
        available: true,
        rating: 4.9,
        reviewCount: 156,
        isFeatured: true,
        featuredRank: 8
    },
    {
        name: 'Mazda Axela',
        brand: 'Mazda',
        model: 'Axela',
        year: 2022,
        category: 'sedan',
        pricePerDay: 5000,
        imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop',
        seats: 5,
        transmission: 'automatic',
        fuelType: 'petrol',
        features: ['Skyactiv Technology', 'Bose Audio', 'Heads-Up Display', 'Leather Interior'],
        location: 'JKIA Airport',
        description: 'Sporty handling meets elegant design. The driver\'s sedan.',
        available: true,
        rating: 4.6,
        reviewCount: 89
    },
    // SUV
    {
        name: 'Toyota RAV4',
        brand: 'Toyota',
        model: 'RAV4',
        year: 2023,
        category: 'suv',
        pricePerDay: 8500,
        imageUrl: 'https://images.unsplash.com/photo-1568844293986-8c8c5f3b3b0e?w=800&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1568844293986-8c8c5f3b3b0e?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1542362567-b05486f69246?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop'
        ],
        seats: 5,
        transmission: 'automatic',
        fuelType: 'hybrid',
        features: ['AWD', 'Hybrid', 'Toyota Safety Sense', 'Panoramic Roof'],
        location: 'JKIA Airport',
        description: 'Versatile SUV for any adventure. From Nairobi traffic to weekend getaways.',
        available: true,
        rating: 4.8,
        reviewCount: 167,
        isFeatured: true,
        featuredRank: 7
    },
    {
        name: 'Mazda CX-5',
        brand: 'Mazda',
        model: 'CX-5',
        year: 2022,
        category: 'suv',
        pricePerDay: 7800,
        imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop',
        seats: 5,
        transmission: 'automatic',
        fuelType: 'petrol',
        features: ['AWD', 'Bose Sound', 'Leather Seats', 'Power Tailgate'],
        location: 'Nairobi CBD',
        description: 'Premium feel at a reasonable price. Great for family trips.',
        available: true,
        rating: 4.7,
        reviewCount: 134
    },
    {
        name: 'Nissan X-Trail',
        brand: 'Nissan',
        model: 'X-Trail',
        year: 2022,
        category: 'suv',
        pricePerDay: 7500,
        imageUrl: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&auto=format&fit=crop',
        seats: 7,
        transmission: 'automatic',
        fuelType: 'petrol',
        features: ['7 Seats', 'AWD', 'Around View Monitor', 'ProPILOT'],
        location: 'Gigiri',
        description: '7-seater family SUV. Perfect for group travel around Lake Victoria.',
        available: true,
        rating: 4.5,
        reviewCount: 98
    },
    {
        name: 'Subaru Forester',
        brand: 'Subaru',
        model: 'Forester',
        year: 2023,
        category: 'suv',
        pricePerDay: 8000,
        imageUrl: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop',
        seats: 5,
        transmission: 'automatic',
        fuelType: 'petrol',
        features: ['Symmetrical AWD', 'EyeSight Safety', 'X-Mode', 'Panoramic Sunroof'],
        location: 'Nakuru CBD',
        description: 'Legendary AWD capability. Handles any road condition with confidence.',
        available: true,
        rating: 4.6,
        reviewCount: 87
    },
    {
        name: 'Honda Vezel',
        brand: 'Honda',
        model: 'Vezel',
        year: 2023,
        category: 'suv',
        pricePerDay: 6500,
        imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop',
        seats: 5,
        transmission: 'automatic',
        fuelType: 'hybrid',
        features: ['Hybrid', 'Magic Seats', 'Honda Sensing', 'Wireless Charging'],
        location: 'Karen',
        description: 'Compact SUV with hybrid efficiency. Great for coastal adventures.',
        available: true,
        rating: 4.5,
        reviewCount: 76
    },
    // SAFARI 4x4
    {
        name: 'Toyota Land Cruiser Prado',
        brand: 'Toyota',
        model: 'Land Cruiser Prado',
        year: 2023,
        category: 'safari',
        pricePerDay: 15000,
        imageUrl: 'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1594502184342-2e12f877aa73?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop'
        ],
        seats: 7,
        transmission: 'automatic',
        fuelType: 'diesel',
        features: ['4x4', 'Crawl Control', 'Multi-Terrain Select', 'Kinetic Suspension'],
        location: 'JKIA Airport',
        description: 'The safari king. Built for Maasai Mara and all your wildlife adventures.',
        available: true,
        rating: 4.9,
        reviewCount: 245,
        isFeatured: true,
        featuredRank: 10
    },
    {
        name: 'Toyota Land Cruiser V8',
        brand: 'Toyota',
        model: 'Land Cruiser 200',
        year: 2022,
        category: 'safari',
        pricePerDay: 20000,
        imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop',
        seats: 8,
        transmission: 'automatic',
        fuelType: 'diesel',
        features: ['V8 Engine', 'Full-Time 4WD', 'Luxury Interior', 'Cooler Box'],
        location: 'Wilson Airport',
        description: 'Ultimate safari luxury. Conquers the toughest terrain in supreme comfort.',
        available: true,
        rating: 5.0,
        reviewCount: 178,
        isFeatured: true,
        featuredRank: 9
    },
    {
        name: 'Toyota Hilux Safari',
        brand: 'Toyota',
        model: 'Hilux Double Cab',
        year: 2023,
        category: 'safari',
        pricePerDay: 12000,
        imageUrl: 'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800&auto=format&fit=crop',
        seats: 5,
        transmission: 'automatic',
        fuelType: 'diesel',
        features: ['4x4', 'Roof Tent Ready', 'Snorkel', 'Heavy Duty Suspension'],
        location: 'Nairobi CBD',
        description: 'Rugged and reliable. Perfect for camping safaris and off-road adventures.',
        available: true,
        rating: 4.7,
        reviewCount: 134
    },
    {
        name: 'Nissan Patrol',
        brand: 'Nissan',
        model: 'Patrol Y62',
        year: 2022,
        category: 'safari',
        pricePerDay: 18000,
        imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop',
        seats: 7,
        transmission: 'automatic',
        fuelType: 'petrol',
        features: ['V8 Engine', 'Hydraulic Body Motion Control', 'Around View', 'Luxury Interior'],
        location: 'JKIA Airport',
        description: 'Powerful V8 luxury meets off-road capability. The desert warrior.',
        available: true,
        rating: 4.8,
        reviewCount: 87
    },
    // LUXURY
    {
        name: 'Mercedes-Benz E-Class',
        brand: 'Mercedes-Benz',
        model: 'E300',
        year: 2023,
        category: 'luxury',
        pricePerDay: 18000,
        imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop'
        ],
        seats: 5,
        transmission: 'automatic',
        fuelType: 'petrol',
        features: ['MBUX System', 'Burmester Sound', 'Massage Seats', 'Air Suspension'],
        location: 'Westlands',
        description: 'Executive elegance. Make an impression at any business meeting.',
        available: true,
        rating: 4.9,
        reviewCount: 67,
        isFeatured: true,
        featuredRank: 6
    },
    {
        name: 'BMW 5 Series',
        brand: 'BMW',
        model: '530i',
        year: 2023,
        category: 'luxury',
        pricePerDay: 17000,
        imageUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&auto=format&fit=crop',
        seats: 5,
        transmission: 'automatic',
        fuelType: 'petrol',
        features: ['iDrive 8', 'Harman Kardon', 'Gesture Control', 'Parking Assistant'],
        location: 'JKIA Airport',
        description: 'The ultimate driving machine. Luxury meets performance.',
        available: true,
        rating: 4.8,
        reviewCount: 54
    },
    {
        name: 'Range Rover Sport',
        brand: 'Land Rover',
        model: 'Range Rover Sport',
        year: 2023,
        category: 'luxury',
        pricePerDay: 25000,
        imageUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&auto=format&fit=crop',
        seats: 5,
        transmission: 'automatic',
        fuelType: 'diesel',
        features: ['Terrain Response', 'Meridian Sound', 'Configurable Dynamics', 'Wade Sensing'],
        location: 'Westlands',
        description: 'The pinnacle of luxury SUVs. Commanding presence on any road.',
        available: true,
        rating: 5.0,
        reviewCount: 45
    },
    {
        name: 'Mercedes-Benz S-Class',
        brand: 'Mercedes-Benz',
        model: 'S580',
        year: 2023,
        category: 'luxury',
        pricePerDay: 35000,
        imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop',
        seats: 5,
        transmission: 'automatic',
        fuelType: 'petrol',
        features: ['Augmented Reality HUD', 'Rear Executive Seats', 'MBUX Hyperscreen', 'E-Active Body Control'],
        location: 'JKIA Airport',
        description: 'The best car in the world. VIP chauffeur experience.',
        available: true,
        rating: 5.0,
        reviewCount: 23
    },
    // VAN/MINIBUS
    {
        name: 'Toyota Noah',
        brand: 'Toyota',
        model: 'Noah',
        year: 2023,
        category: 'van',
        pricePerDay: 8000,
        imageUrl: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop',
        seats: 8,
        transmission: 'automatic',
        fuelType: 'hybrid',
        features: ['Hybrid', 'Sliding Doors', 'Flat Floor', 'USB Charging All Rows'],
        location: 'JKIA Airport',
        description: 'Family-friendly minivan. Perfect for airport pickups and group travel.',
        available: true,
        rating: 4.7,
        reviewCount: 156
    },
    {
        name: 'Toyota Voxy',
        brand: 'Toyota',
        model: 'Voxy',
        year: 2022,
        category: 'van',
        pricePerDay: 7500,
        imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop',
        seats: 8,
        transmission: 'automatic',
        fuelType: 'hybrid',
        features: ['Hybrid', 'Dual Sliding Doors', 'Spacious Interior', 'Low Floor'],
        location: 'Nairobi CBD',
        description: 'Sporty minivan with excellent fuel economy. Great for tours.',
        available: true,
        rating: 4.6,
        reviewCount: 123
    },
    {
        name: 'Toyota Hiace',
        brand: 'Toyota',
        model: 'Hiace',
        year: 2023,
        category: 'van',
        pricePerDay: 12000,
        imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop',
        seats: 14,
        transmission: 'automatic',
        fuelType: 'diesel',
        features: ['14 Seats', 'AC', 'Tour Ready', 'Luggage Space'],
        location: 'Wilson Airport',
        description: 'The ultimate group transport. Perfect for safari tours and corporate events.',
        available: true,
        rating: 4.5,
        reviewCount: 234
    },
    {
        name: 'Toyota Alphard',
        brand: 'Toyota',
        model: 'Alphard',
        year: 2023,
        category: 'van',
        pricePerDay: 15000,
        imageUrl: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop',
        seats: 7,
        transmission: 'automatic',
        fuelType: 'hybrid',
        features: ['Executive Seating', 'Ottoman Seats', 'JBL Sound', 'Captain Chairs'],
        location: 'Westlands',
        description: 'VIP minivan. First-class travel for discerning passengers.',
        available: true,
        rating: 4.9,
        reviewCount: 67
    },
    // PICKUP
    {
        name: 'Toyota Hilux',
        brand: 'Toyota',
        model: 'Hilux Double Cab',
        year: 2023,
        category: 'pickup',
        pricePerDay: 9000,
        imageUrl: 'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800&auto=format&fit=crop',
        images: [
            'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1494905998402-395d579af36f?w=800&auto=format&fit=crop'
        ],
        seats: 5,
        transmission: 'automatic',
        fuelType: 'diesel',
        features: ['4x4', 'Bed Liner', 'Tow Bar', 'Diff Lock'],
        location: 'Nakuru CBD',
        description: 'Indestructible workhorse. Handles any job in any condition.',
        available: true,
        rating: 4.8,
        reviewCount: 189
    },
    {
        name: 'Ford Ranger',
        brand: 'Ford',
        model: 'Ranger Wildtrak',
        year: 2023,
        category: 'pickup',
        pricePerDay: 10000,
        imageUrl: 'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800&auto=format&fit=crop',
        seats: 5,
        transmission: 'automatic',
        fuelType: 'diesel',
        features: ['Bi-Turbo Engine', 'SYNC 4', 'Roller Shutter', 'Sport Bar'],
        location: 'Kilimani',
        description: 'Tough and capable. Perfect for work and weekend adventures.',
        available: true,
        rating: 4.7,
        reviewCount: 76
    },
    {
        name: 'Isuzu D-Max',
        brand: 'Isuzu',
        model: 'D-Max',
        year: 2022,
        category: 'pickup',
        pricePerDay: 8500,
        imageUrl: 'https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=800&auto=format&fit=crop',
        seats: 5,
        transmission: 'automatic',
        fuelType: 'diesel',
        features: ['4x4', 'Hill Descent Control', 'Bi-LED Headlights', 'Leather Seats'],
        location: 'JKIA Airport',
        description: 'Built for African roads. Reliable and fuel efficient.',
        available: true,
        rating: 4.5,
        reviewCount: 98
    }
];

const seedKenyaFleet = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔗 Connected to MongoDB for seeding...');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await Category.deleteMany();
        await Car.deleteMany();

        // Seed categories
        console.log('📁 Seeding categories...');
        await Category.create(categories);
        console.log(`   ✅ ${categories.length} categories created`);

        // Seed cars (locations use NAIROBI_LOCATIONS from config)
        console.log('🚗 Seeding Kenya car fleet...');
        await Car.create(cars);
        console.log(`   ✅ ${cars.length} cars created`);

        // Clear cache
        console.log('🧹 Clearing car cache...');
        await clearCarCache();
        console.log('   ✅ Cache cleared');

        // Summary
        console.log('\n📊 FLEET SUMMARY:');
        console.log('─'.repeat(40));
        const categoryCounts = {};
        cars.forEach(car => {
            categoryCounts[car.category] = (categoryCounts[car.category] || 0) + 1;
        });
        Object.entries(categoryCounts).forEach(([cat, count]) => {
            console.log(`   ${cat.padEnd(12)} : ${count} cars`);
        });
        console.log('─'.repeat(40));
        console.log(`   TOTAL      : ${cars.length} cars`);
        console.log(`   FEATURED   : ${cars.filter(c => c.isFeatured).length} cars`);
        console.log(`   LOCATIONS  : ${NAIROBI_LOCATIONS.length} Nairobi pickup points`);

        console.log('\n✅ Kenya fleet seeded successfully!');
        console.log('🌐 Visit http://localhost:8080 to see the fleet');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedKenyaFleet();
