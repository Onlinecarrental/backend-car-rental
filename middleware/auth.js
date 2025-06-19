const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate JWT token
exports.authenticateToken = (req, res, next) => {
    // Get token from header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Add user from payload
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

// Middleware to check if user is admin
exports.isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user && user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ message: 'Access denied. Admin only.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Middleware to check if user is an agent
exports.isAgent = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (user && (user.role === 'agent' || user.role === 'admin')) {
            next();
        } else {
            res.status(403).json({ message: 'Access denied. Agent or Admin only.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
