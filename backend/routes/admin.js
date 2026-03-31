const express = require('express');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Apply authentication and admin-only middleware to all routes
router.use(protect);
router.use(restrictTo('admin'));

// Create new admin (only existing admin can do this)
router.post('/create-admin', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        const admin = new User({
            name,
            email,
            password,
            role: 'admin',
            createdBy: req.user._id  // Track who created this admin
        });
        
        await admin.save();
        
        res.status(201).json({
            message: 'Admin created successfully',
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Create student (admin only)
router.post('/create-student', async (req, res) => {
    try {
        const { name, email, password, rollNumber, department, semester, batch, phone, address } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Create user account
        const user = new User({
            name,
            email,
            password,
            role: 'student',
            createdBy: req.user._id,
            isActive: true
        });
        await user.save();
        
        // Create student profile
        const student = new Student({
            userId: user._id,
            rollNumber,
            department,
            semester: semester || 1,
            batch: batch || new Date().getFullYear().toString(),
            phone,
            address
        });
        await student.save();
        
        res.status(201).json({
            message: 'Student created successfully',
            student: {
                id: student._id,
                name: user.name,
                email: user.email,
                rollNumber: student.rollNumber
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Create teacher (admin only)
router.post('/create-teacher', async (req, res) => {
    try {
        const { name, email, password, employeeId, department, designation, qualification, specialization, phone } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        const user = new User({
            name,
            email,
            password,
            role: 'teacher',
            createdBy: req.user._id,
            isActive: true
        });
        await user.save();
        
        const teacher = new Teacher({
            userId: user._id,
            employeeId,
            department,
            designation,
            qualification,
            specialization,
            phone
        });
        await teacher.save();
        
        res.status(201).json({
            message: 'Teacher created successfully',
            teacher: {
                id: teacher._id,
                name: user.name,
                email: user.email,
                employeeId: teacher.employeeId
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Deactivate user (admin can disable accounts)
router.patch('/deactivate-user/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Prevent deactivating yourself
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ error: 'You cannot deactivate your own account' });
        }
        
        user.isActive = !user.isActive;
        await user.save();
        
        res.json({
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            isActive: user.isActive
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all users (with filters)
router.get('/users', async (req, res) => {
    try {
        const { role, isActive } = req.query;
        let filter = {};
        
        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        
        const users = await User.find(filter).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;