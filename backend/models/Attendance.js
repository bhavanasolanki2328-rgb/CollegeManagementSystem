const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late'],
        default: 'absent'
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    }
});

AttendanceSchema.index({ courseId: 1, studentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);