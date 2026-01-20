const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler.middleware');
const { sendSuccess, sendError } = require('./utils/response');

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Body parser
app.use(morgan('dev')); // Logger

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
