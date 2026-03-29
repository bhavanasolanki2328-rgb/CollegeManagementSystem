const express = require('express');
const Grade = require('../models/Grade');
const Course = require('../models/Course');
const Student = require('../models/Student');
const { auth, checkRole } = require('../middleware/auth');

const router = express.Router();

// Calculate grade based on marks
const calculateGrade = (marks) => {
    if (marks >= 90) return 'O';
    if (marks >= 80) return 'A+';
    if (marks >= 70) return 'A';
    if (marks >= 60) return 'B+';
    if (marks >= 50) return 'B';
    if (marks >= 40) return 'C';
    return 'F';
};

// Add/Update grades (Teacher only)
router.post('/', auth, checkRole(['teacher', 'admin']), async (req, res) => {
    try {
        const { studentId, courseId, semester, internalMarks, externalMarks, remarks } = req.body;
        
        // Check if teacher is assigned to this course
        if (req.user.role === 'teacher') {
            const course = await Course.findById(courseId);
            if (course.teacherId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'Not authorized for this course' });
            }
        }
        
        const totalMarks = internalMarks + externalMarks;
        const grade = calculateGrade(totalMarks);
        
        const gradeRecord = await Grade.findOneAndUpdate(
            { studentId, courseId, semester },
            { internalMarks, externalMarks, totalMarks, grade, remarks },
            { upsert: true, new: true }
        );
        
        res.json(gradeRecord);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get grades for a student
router.get('/student/:studentId', auth, async (req, res) => {
    try {
        const grades = await Grade.find({ studentId: req.params.studentId })
            .populate('courseId', 'courseName courseCode credits');
        
        // Calculate SGPA (Simple calculation - can be modified)
        let totalPoints = 0;
        let totalCredits = 0;
        
        const gradePoints = {
            'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'F': 0
        };
        
        grades.forEach(grade => {
            const points = gradePoints[grade.grade] || 0;
            totalPoints += points * (grade.courseId?.credits || 0);
            totalCredits += grade.courseId?.credits || 0;
        });
        
        const sgpa = totalCredits ? (totalPoints / totalCredits).toFixed(2) : 0;
        
        res.json({
            grades,
            summary: {
                totalCredits,
                totalPoints,
                sgpa
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get grades for a course
router.get('/course/:courseId', auth, async (req, res) => {
    try {
        const grades = await Grade.find({ courseId: req.params.courseId })
            .populate('studentId', 'rollNumber')
            .populate('courseId', 'courseName');
        
        res.json(grades);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;