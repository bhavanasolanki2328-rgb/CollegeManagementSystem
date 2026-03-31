const express = require('express');
const Timetable = require('../models/Timetable');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get timetable for student
router.get('/student/:studentId', protect, async (req, res) => {
    try {
        // Get student's department and semester
        const Student = require('../models/Student');
        const student = await Student.findById(req.params.studentId);
        
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        const timetable = await Timetable.find({
            department: student.department,
            semester: student.semester
        }).populate('courseId', 'courseName courseCode')
          .populate('teacherId', 'userId');
        
        res.json(timetable);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create timetable (admin only)
router.post('/', protect, restrictTo('admin'), async (req, res) => {
    try {
        const timetable = new Timetable(req.body);
        await timetable.save();
        res.status(201).json(timetable);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;