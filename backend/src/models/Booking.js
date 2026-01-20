const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        required: true,
        unique: true
    },
    car: {
        type: mongoose.Schema.ObjectId,
        ref: 'Car',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false // Optional for guest checkout
    },
    customerName: {
        type: String,
        required: [true, 'Please add a customer name']
    },
    customerEmail: {
        type: String,
        required: [true, 'Please add a customer email'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    customerPhone: {
        type: String,
        required: [true, 'Please add a customer phone number']
    },
    pickupDate: {
        type: Date,
        required: [true, 'Please add a pickup date']
    },
    returnDate: {
        type: Date,
        required: [true, 'Please add a return date']
    },
    pickupLocation: {
        type: String,
        required: [true, 'Please add a pickup location']
    },
    returnLocation: {
        type: String,
        required: [true, 'Please add a return location']
    },
    extras: [{
        type: String // Extra IDs
    }],
    totalDays: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', bookingSchema);
