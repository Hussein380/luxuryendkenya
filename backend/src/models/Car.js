const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a car name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    brand: {
        type: String,
        required: [true, 'Please add a brand']
    },
    model: {
        type: String,
        required: [true, 'Please add a model']
    },
    year: {
        type: Number,
        required: [true, 'Please add a year']
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        lowercase: true,
        trim: true
        // No enum - validates against Category collection dynamically
    },
    pricePerDay: {
        type: Number,
        required: [true, 'Please add a price per day']
    },
    imageUrl: {
        type: String,
        required: [true, 'Please add an image URL']
    },
    images: {
        type: [String],
        default: []
    },
    seats: {
        type: Number,
        required: [true, 'Please add number of seats']
    },
    transmission: {
        type: String,
        required: [true, 'Please add transmission type'],
        enum: ['automatic', 'manual']
    },
    fuelType: {
        type: String, // electric, petrol, diesel, hybrid, etc.
        required: [true, 'Please add fuel type'],
        enum: ['petrol', 'diesel', 'electric', 'hybrid']
    },
    features: {
        type: [String],
        default: []
    },
    location: {
        type: String, // Reference name from Location model or just string
        required: [true, 'Please add a location']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    available: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    featuredRank: {
        type: Number,
        default: 0
    },
    featuredUntil: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for search functionality
carSchema.index({ name: 'text', brand: 'text', model: 'text', description: 'text' });

module.exports = mongoose.model('Car', carSchema);
