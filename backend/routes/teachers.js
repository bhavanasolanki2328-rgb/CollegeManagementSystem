const express = require('express');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Get all teachers - Admin only
router.get('/', protect, restrictTo('admin'), async (req, res) => {
    try {
        const teachers = await Teacher.find().populate('userId', 'name email');
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single teacher
router.get('/:id', protect, async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id).populate('userId', 'name email');
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        res.json(teacher);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create teacher - Admin only
router.post('/', protect, restrictTo('admin'), async (req, res) => {
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

// Update teacher
router.put('/:id', protect, restrictTo('admin'), async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        res.json(teacher);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete teacher - Admin only
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        
        await User.findByIdAndDelete(teacher.userId);
        await Teacher.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Teacher deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;