const express = require('express');
const Student = require('../models/Student');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// ========== GET ALL STUDENTS ==========
router.get('/', protect, restrictTo('admin'), async (req, res) => {
    try {
        const students = await Student.find().populate('userId', 'name email');
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== GET STUDENT BY EMAIL ==========
router.get('/email/:email', protect, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const student = await Student.findOne({ userId: user._id }).populate('userId', 'name email');
        if (!student) {
            return res.status(404).json({ error: 'Student profile not found' });
        }
        
        res.json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== GET STUDENTS BY DEPARTMENT AND SEMESTER (FILTER) ==========
router.get('/filter', protect, async (req, res) => {
    try {
        const { department, semester } = req.query;
        let query = {};
        
        if (department) {
            query.department = department;
        }
        if (semester) {
            query.semester = parseInt(semester);
        }
        
        const students = await Student.find(query).populate('userId', 'name email');
        res.json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========== GET SINGLE STUDENT BY ID ==========
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

// ========== CREATE STUDENT (ADMIN ONLY) ==========
router.post('/', protect, restrictTo('admin'), async (req, res) => {
    try {
        const { 
            name, 
            email, 
            password, 
            rollNumber, 
            department, 
            semester, 
            batch,
            phone, 
            address, 
            parentName, 
            parentPhone,
            dateOfBirth, 
            bloodGroup, 
            enrollmentYear
        } = req.body;
        
        // Validate required fields
        if (!name) return res.status(400).json({ error: 'Name is required' });
        if (!email) return res.status(400).json({ error: 'Email is required' });
        if (!password) return res.status(400).json({ error: 'Password is required' });
        if (!rollNumber) return res.status(400).json({ error: 'Roll number is required' });
        if (!department) return res.status(400).json({ error: 'Department is required' });
        if (!semester) return res.status(400).json({ error: 'Semester is required' });
        if (!batch) return res.status(400).json({ error: 'Batch is required' });
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Check if roll number already exists
        const existingStudent = await Student.findOne({ rollNumber });
        if (existingStudent) {
            return res.status(400).json({ error: 'Roll number already exists' });
        }
        
        // Create user account
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
            semester: parseInt(semester),
            batch,
            phone: phone || '',
            address: address || '',
            parentName: parentName || '',
            parentPhone: parentPhone || '',
            dateOfBirth: dateOfBirth || '',
            bloodGroup: bloodGroup || '',
            enrollmentYear: enrollmentYear || ''
        });
        await student.save();
        
        // Return the created student with populated user info
        const savedStudent = await Student.findById(student._id).populate('userId', 'name email');
        
        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            student: savedStudent
        });
        
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(400).json({ error: error.message });
    }
});

// ========== UPDATE STUDENT ==========
router.put('/:id', protect, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        // Admin can update everything
        if (req.user.role === 'admin') {
            const allowedUpdates = [
                'rollNumber', 'department', 'semester', 'batch',
                'enrollmentYear', 'phone', 'address', 
                'parentName', 'parentPhone', 'dateOfBirth', 'bloodGroup'
            ];
            
            const updates = {};
            allowedUpdates.forEach(field => {
                if (req.body[field] !== undefined) {
                    updates[field] = req.body[field];
                }
            });
            
            const updatedStudent = await Student.findByIdAndUpdate(
                req.params.id,
                updates,
                { new: true, runValidators: true }
            ).populate('userId', 'name email');
            
            // Also update user name if provided
            if (req.body.name) {
                await User.findByIdAndUpdate(student.userId, { name: req.body.name });
            }
            
            return res.json(updatedStudent);
        }
        
        // Students can only update limited fields
        const allowedUpdates = ['phone', 'address'];
        const updates = {};
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });
        
        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).populate('userId', 'name email');
        
        res.json(updatedStudent);
        
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(400).json({ error: error.message });
    }
});

// ========== DELETE STUDENT (ADMIN ONLY) ==========
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        // Delete the user account
        await User.findByIdAndDelete(student.userId);
        
        // Delete the student profile
        await Student.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Student deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;