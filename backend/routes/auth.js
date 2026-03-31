const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();


// Check if admin already exists (for frontend to know)
router.get('/check-admin-exists', async (req, res) => {
    try {
        const adminExists = await User.adminExists();
        res.json({ adminExists });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// First-time admin registration (only works if no admin exists)
router.post('/register-first-admin', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if admin already exists
        const adminExists = await User.adminExists();
        if (adminExists) {
            return res.status(403).json({ 
                error: 'Setup already completed. Admin registration is closed.' 
            });
        }
        
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        
        // Check if user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Create admin user
        const admin = new User({
            name,
            email,
            password,
            role: 'admin',
            createdBy: null  // First admin has no creator
        });
        
        await admin.save();
        
        // Generate token
        const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, {
            expiresIn: '7d'
        });
        
        res.status(201).json({
            message: 'Admin account created successfully',
            token,
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Normal login (for everyone - admin, teacher, student)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        
        // Find user
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({ error: 'Account deactivated. Contact admin.' });
        }
        
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        
        // Generate token
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
            expiresIn: '7d'
        });
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get current user
router.get('/me', protect, async (req, res) => {
    res.json({
        user: req.user
    });
});

module.exports = router;