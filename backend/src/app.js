const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler.middleware');
const { sendSuccess, sendError } = require('./utils/response');
const { globalLimiter } = require('./middleware/rateLimit.middleware');

const app = express();

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

// Base route for health check
app.get('/', (req, res) => {
    sendSuccess(res, { status: 'online', version: '1.0.0' }, 'DriveEase API is running');
});

// Handle 404
app.use((req, res) => {
    sendError(res, 'Route not found', 404);
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
