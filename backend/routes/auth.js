const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const { auth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, rollNumber, employeeId, department } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const user = new User({ name, email, password, role });
        await user.save();

        if (role === 'student' && rollNumber) {
            const student = new Student({
                userId: user._id,
                rollNumber,
                department,
                semester: 1,
                batch: new Date().getFullYear().toString()
            });
            await student.save();
        } else if (role === 'teacher' && employeeId) {
            const teacher = new Teacher({
                userId: user._id,
                employeeId,
                department
            });
            await teacher.save();
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET);
        res.status(201).json({ user, token, role: user.role });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET);
        
        let profile = null;
        if (user.role === 'student') {
            profile = await Student.findOne({ userId: user._id });
        } else if (user.role === 'teacher') {
            profile = await Teacher.findOne({ userId: user._id });
        }

        res.json({ user, profile, token, role: user.role });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        let profile = null;
        if (req.user.role === 'student') {
            profile = await Student.findOne({ userId: req.user._id });
        } else if (req.user.role === 'teacher') {
            profile = await Teacher.findOne({ userId: req.user._id });
        }
        
        res.json({ user: req.user, profile });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;