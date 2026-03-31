const express = require('express');
const Attendance = require('../models/Attendance');
const Course = require('../models/Course');
const Student = require('../models/Student');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Mark attendance (Teacher only)
router.post('/', protect, restrictTo(['teacher', 'admin']), async (req, res) => {
    try {
        const { courseId, date, records } = req.body;
        
        // Check if teacher is assigned to this course
        if (req.user.role === 'teacher') {
            const course = await Course.findById(courseId);
            if (course.teacherId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'Not authorized for this course' });
            }
        }
        
        const attendanceRecords = [];
        for (const record of records) {
            const attendance = await Attendance.findOneAndUpdate(
                { courseId, studentId: record.studentId, date: new Date(date) },
                { status: record.status, markedBy: req.user._id },
                { upsert: true, new: true }
            );
            attendanceRecords.push(attendance);
        }
        
        res.json(attendanceRecords);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get attendance for a course
router.get('/course/:courseId', protect, async (req, res) => {
    try {
        const { date } = req.query;
        let query = { courseId: req.params.courseId };
        
        if (date) {
            query.date = new Date(date);
        }
        
        const attendance = await Attendance.find(query)
            .populate('studentId', 'rollNumber')
            .populate('markedBy', 'name');
        
        res.json(attendance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get student attendance
router.get('/student/:studentId', protect, async (req, res) => {
    try {
        const { courseId, from, to } = req.query;
        let query = { studentId: req.params.studentId };
        
        if (courseId) query.courseId = courseId;
        if (from) query.date = { $gte: new Date(from) };
        if (to) query.date = { ...query.date, $lte: new Date(to) };
        
        const attendance = await Attendance.find(query)
            .populate('courseId', 'courseName courseCode')
            .sort({ date: -1 });
        
        // Calculate statistics
        const totalDays = attendance.length;
        const presentDays = attendance.filter(a => a.status === 'present').length;
        const attendancePercentage = totalDays ? (presentDays / totalDays) * 100 : 0;
        
        res.json({
            records: attendance,
            statistics: {
                totalDays,
                presentDays,
                attendancePercentage: attendancePercentage.toFixed(2)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;