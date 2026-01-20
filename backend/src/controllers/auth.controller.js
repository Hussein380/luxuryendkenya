const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendSuccess, sendError } = require('../utils/response');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role
        });

        const token = generateToken(user._id);

        sendSuccess(res, {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        }, 'User registered successfully', 201);
    } catch (error) {
        sendError(res, error.message, 400);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return sendError(res, 'Please provide an email and password', 400);
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return sendError(res, 'Invalid credentials', 401);
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return sendError(res, 'Invalid credentials', 401);
        }

        const token = generateToken(user._id);

        sendSuccess(res, {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        }, 'User logged in successfully');
    } catch (error) {
        sendError(res, error.message, 500);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        sendSuccess(res, user);
    } catch (error) {
        sendError(res, error.message, 500);
    }
};
