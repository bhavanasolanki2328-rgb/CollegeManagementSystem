const express = require('express');
const Course = require('../models/Course');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Get all courses
router.get('/', protect, async (req, res) => {
    try {
        let query = {};
        
        if (req.user.role === 'teacher') {
            query.teacherId = req.user._id;
        } else if (req.user.role === 'student') {
            // For students, we'll get courses based on their department and semester
            // This would require student info, implement as needed
        }
        
        const courses = await Course.find(query).populate('teacherId', 'userId');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single course
router.get('/:id', protect, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('teacherId', 'userId');
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create course (Admin only)
router.post('/', protect, restrictTo(['admin']), async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(201).json(course);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update course (Admin only)
router.put('/:id', protect, restrictTo(['admin']), async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json(course);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete course (Admin only)
router.delete('/:id', protect, restrictTo(['admin']), async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;