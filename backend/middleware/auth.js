const jwt = require('jsonwebtoken');
const User = require('../models/User');

// IMPORTANT: Use the SAME secret for both signing and verifying
const JWT_SECRET = 'your-super-secret-key-2024';

// Middleware to protect routes
const protect = async (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (!token) {
            return res.status(401).json({ error: 'Not authorized, please login' });
        }
        
        // Verify with the SAME secret
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        return res.status(401).json({ error: 'Not authorized' });
    }
};

// Restrict to roles
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: `Access denied. ${req.user.role} cannot perform this action.` 
            });
        }
        next();
    };
};

module.exports = { protect, restrictTo, JWT_SECRET };