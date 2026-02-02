const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler.middleware');
const { sendSuccess, sendError } = require('./utils/response');
const { globalLimiter } = require('./middleware/rateLimit.middleware');

const app = express();

// Trust proxy (required for Vercel/reverse proxies)
app.set('trust proxy', 1);

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Body parser

// HTTP Request Logging (Morgan + Winston)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
    stream: {
        write: (message) => logger.http(message.trim()),
    },
}));

// Security: Rate Limiting (Applied to all /api routes)
app.use('/api', globalLimiter);

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/cars', require('./routes/cars.routes'));
app.use('/api/bookings', require('./routes/bookings.routes'));
app.use('/api/ai', require('./routes/ai.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/users', require('./routes/users.routes'));

// Base route for health check
app.get('/', (req, res) => {
    sendSuccess(res, { status: 'online', version: '1.0.0' }, 'DriveEase API is running');
});

// Debug endpoint - shows which MongoDB database is connected
app.get('/api/debug', async (req, res) => {
    const mongoose = require('mongoose');
    const Car = require('./models/Car');
    try {
        const dbName = mongoose.connection?.db?.databaseName || 'not connected';
        const carCount = await Car.countDocuments();
        const mongoUri = process.env.MONGODB_URI || 'not set';
        // Mask password in URI for safety
        const maskedUri = mongoUri.replace(/:[^:@]+@/, ':****@');
        sendSuccess(res, {
            database: dbName,
            carCount,
            mongoUri: maskedUri,
            redisUrl: process.env.REDIS_URL ? 'set' : 'not set',
            nodeEnv: process.env.NODE_ENV,
            isVercel: !!process.env.VERCEL,
        });
    } catch (err) {
        sendError(res, err.message, 500);
    }
});

// Test endpoint - returns cars directly (no cache)
app.get('/api/test-cars', async (req, res) => {
    const Car = require('./models/Car');
    try {
        const cars = await Car.find({}).limit(5);
        sendSuccess(res, {
            count: cars.length,
            cars: cars.map(c => ({ id: c._id, name: c.name, brand: c.brand }))
        });
    } catch (err) {
        sendError(res, err.message, 500);
    }
});

// Handle 404
app.use((req, res) => {
    sendError(res, 'Route not found', 404);
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
