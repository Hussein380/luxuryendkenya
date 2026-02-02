/**
 * Vercel serverless entry for Express backend.
 * Handles all /api/* requests.
 * Env vars: set in Vercel dashboard (or .env for local vercel dev)
 */
try {
    require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
} catch (_) {
    // dotenv optional (Vercel injects env at runtime)
}

let connectDB;
let app;
let loadError = null;

try {
    connectDB = require('../backend/src/config/database');
    app = require('../backend/src/app');
} catch (err) {
    loadError = err;
    console.error('Failed to load backend:', err.message, err.stack);
}

let dbPromise = null;

module.exports = async (req, res) => {
    try {
        if (!app) {
            return res.status(500).json({
                success: false,
                error: loadError ? loadError.message : 'Backend failed to load.',
            });
        }
        if (!dbPromise) {
            dbPromise = connectDB().catch((err) => {
                console.error('DB connection failed:', err.message);
                throw err;
            });
        }
        await dbPromise;
        return app(req, res);
    } catch (err) {
        console.error('API handler error:', err);
        return res.status(500).json({
            success: false,
            error: err.message || 'Internal server error',
        });
    }
};
