const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const teacherRoutes = require('./routes/teachers');
const courseRoutes = require('./routes/courses');
const attendanceRoutes = require('./routes/attendance');
const gradeRoutes = require('./routes/grades');
const feeRoutes = require('./routes/fees');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/fees', feeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});