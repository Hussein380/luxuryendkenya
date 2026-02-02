const winston = require('winston');

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Set level based on environment
const level = () => {
    const env = process.env.NODE_ENV || 'development';
    return env === 'development' ? 'debug' : 'warn';
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};

winston.addColors(colors);

// Custom format
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
);

// File transport format (No colors, pure text)
const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.printf(
        (info) => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`
    )
);

// Define transports - on Vercel/serverless, console only (no writable filesystem)
const transports = [new winston.transports.Console({ format })];
if (!process.env.VERCEL) {
    try {
        transports.push(
            new winston.transports.File({ filename: 'logs/error.log', level: 'error', format: fileFormat }),
            new winston.transports.File({ filename: 'logs/combined.log', format: fileFormat })
        );
    } catch (_) {
        // Fallback to console-only if file transport fails
    }
}

const logger = winston.createLogger({
    level: level(),
    levels,
    transports,
});

module.exports = logger;
