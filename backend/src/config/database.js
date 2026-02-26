const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // 5 seconds timeout
        });
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        logger.error(`MongoDB Connection Error: ${error.message}`);
        if (error.reason) logger.error(`Connection Reason: ${JSON.stringify(error.reason)}`);
        throw error; // Rethrow to let calling code handle failure
    }
};

module.exports = connectDB;
