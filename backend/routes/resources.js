const express = require('express');
const Resource = require('../models/Resource');
const Course = require('../models/Course');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Get all resources (for students)
router.get('/', protect, async (req, res) => {
    try {
        let query = {};
        
        // If student, show only resources for their enrolled courses
        if (req.user.role === 'student') {
            // Get student's enrolled courses
            // This depends on your enrollment system
            query = {}; // Modify based on your logic
        }
        
        const resources = await Resource.find(query)
            .populate('courseId', 'courseName courseCode')
            .populate('teacherId', 'userId')
            .sort({ uploadedAt: -1 });
        
        res.json(resources);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload resource (teacher only)
router.post('/', protect, restrictTo('teacher', 'admin'), async (req, res) => {
    try {
        const { title, description, courseId, fileUrl, fileType } = req.body;
        
        const resource = new Resource({
            title,
            description,
            courseId,
            teacherId: req.user._id,
            fileUrl,
            fileType
        });
        
        await resource.save();
        res.status(201).json(resource);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete resource (teacher or admin)
router.delete('/:id', protect, restrictTo('teacher', 'admin'), async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }
        
        await resource.deleteOne();
        res.json({ message: 'Resource deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;