const express = require('express');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// Get all teachers (Admin only)
router.get('/', auth, checkRole(['admin']), async (req, res) => {
    try {
        const teachers = await Teacher.find().populate('userId', 'name email');
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single teacher
router.get('/:id', auth, async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id).populate('userId', 'name email');
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        
        if (req.user.role !== 'admin' && teacher.userId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        res.json(teacher);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create teacher (Admin only)
router.post('/', auth, checkRole(['admin']), async (req, res) => {
    try {
        const { name, email, password, employeeId, department, designation, qualification, specialization, phone } = req.body;
        
        const user = new User({ name, email, password, role: 'teacher' });
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
        
        res.status(201).json(teacher);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update teacher
router.put('/:id', auth, async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        
        if (req.user.role !== 'admin') {
            const user = await User.findById(teacher.userId);
            if (user._id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }
        
        const updates = Object.keys(req.body);
        updates.forEach(update => {
            teacher[update] = req.body[update];
        });
        await teacher.save();
        
        res.json(teacher);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete teacher (Admin only)
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
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