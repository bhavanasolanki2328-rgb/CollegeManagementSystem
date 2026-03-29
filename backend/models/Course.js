const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    courseCode: {
        type: String,
        required: true,
        unique: true
    },
    courseName: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    credits: {
        type: Number,
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    description: String,
    schedule: {
        day: String,
        startTime: String,
        endTime: String,
        room: String
    }
});

module.exports = mongoose.model('Course', CourseSchema);