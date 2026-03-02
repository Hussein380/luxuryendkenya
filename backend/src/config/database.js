const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 15000, // Increased to 15 seconds
        });
        // Disable buffering so we don't hang for 10s before failing
        mongoose.set('bufferCommands', false);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        logger.error(`MongoDB Connection Error: ${error.message}`);
        if (error.reason) logger.error(`Connection Reason: ${JSON.stringify(error.reason)}`);
        throw error; // Rethrow to let calling code handle failure
    }
};

module.exports = connectDB;
