const express = require('express');
const Student = require('../models/Student');
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// Get all students (Admin only)
router.get('/', auth, checkRole(['admin']), async (req, res) => {
    try {
        const students = await Student.find().populate('userId', 'name email');
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single student
router.get('/:id', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('userId', 'name email');
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        // Check if user has access
        if (req.user.role !== 'admin' && req.user.role !== 'teacher' && 
            student.userId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        res.json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create student (Admin only)
router.post('/', auth, checkRole(['admin']), async (req, res) => {
    try {
        const { name, email, password, rollNumber, department, semester, batch, phone, address } = req.body;
        
        const user = new User({ name, email, password, role: 'student' });
        await user.save();
        
        const student = new Student({
            userId: user._id,
            rollNumber,
            department,
            semester,
            batch,
            phone,
            address
        });
        await student.save();
        
        res.status(201).json(student);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update student
router.put('/:id', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        // Check authorization
        if (req.user.role !== 'admin') {
            const user = await User.findById(student.userId);
            if (user._id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }
        
        const updates = Object.keys(req.body);
        updates.forEach(update => {
            student[update] = req.body[update];
        });
        await student.save();
        
        res.json(student);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete student (Admin only)
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
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