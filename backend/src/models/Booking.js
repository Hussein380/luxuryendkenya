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
    firstName: {
        type: String,
        required: [true, 'Please add a first name']
    },
    lastName: {
        type: String,
        required: [true, 'Please add a last name']
    },
    customerEmail: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ],
        required: false
    },
    customerPhone: {
        type: String,
        required: [true, 'Please add a phone number']
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
    idImageUrl: {
        type: String,
        required: [true, 'Please upload an ID image']
    },
    licenseImageUrl: {
        type: String,
        required: [true, 'Please upload a driving license image']
    },
    bookingType: {
        type: String,
        enum: ['book_now', 'reserve'],
        required: true
    },
    paymentDetails: {
        transactionId: String,
        amount: Number,
        paidAt: Date,
        mpesaReceiptNumber: String,
        resultDesc: String
    },
    status: {
        type: String,
        enum: ['pending', 'reserved', 'confirmed', 'paid', 'cancelled', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', bookingSchema);
