const mongoose = require('mongoose');

const bookingExtraSchema = new mongoose.Schema({
    id: {
        type: String,
        required: [true, 'Please add a unique ID for the extra'],
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Please add a name for the extra'],
        trim: true
    },
    pricePerDay: {
        type: Number,
        required: [true, 'Please add a price per day for the extra']
    },
    available: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('BookingExtra', bookingExtraSchema);
