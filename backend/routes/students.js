const express = require('express');
const Student = require('../models/Student');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Get all students - Admin only
router.get('/', protect, restrictTo('admin'), async (req, res) => {
    try {
        const students = await Student.find().populate('userId', 'name email');
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single student
router.get('/:id', protect, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('userId', 'name email');
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create student - Admin only
router.post('/', protect, restrictTo('admin'), async (req, res) => {
    try {
        const { name, email, password, rollNumber, department, semester, batch, phone, address } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Create user
        const user = new User({
            name,
            email,
            password,
            role: 'student',
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

// Update student
router.put('/:id', protect, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        const allowedUpdates = ['phone', 'address', 'semester'];
        const updates = Object.keys(req.body);
        const isValidUpdate = updates.every(update => allowedUpdates.includes(update));
        
        if (req.user.role !== 'admin' && !isValidUpdate) {
            return res.status(403).json({ error: 'You can only update phone and address' });
        }
        
        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        res.json(updatedStudent);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete student - Admin only
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        await User.findByIdAndDelete(student.userId);
        await Student.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;