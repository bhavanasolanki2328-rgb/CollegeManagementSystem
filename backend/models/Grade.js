const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    internalMarks: {
        type: Number,
        default: 0
    },
    externalMarks: {
        type: Number,
        default: 0
    },
    totalMarks: {
        type: Number,
        default: 0
    },
    grade: {
        type: String,
        enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'F'],
        default: 'F'
    },
    remarks: String
});

module.exports = mongoose.model('Grade', GradeSchema);