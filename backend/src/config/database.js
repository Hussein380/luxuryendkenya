const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        logger.info(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        logger.error(`MongoDB Connection Error: ${error.message}`);
        // If it's an initial connection error, let the calling code handle it
        // and avoid process.exit(1) to prevent crash-loops during internet flickers.
    }
};

module.exports = connectDB;
