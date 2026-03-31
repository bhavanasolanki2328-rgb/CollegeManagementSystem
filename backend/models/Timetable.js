const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        required: true
    },
    startTime: String,
    endTime: String,
    room: String,
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    semester: Number,
    department: String
});

module.exports = mongoose.model('Timetable', TimetableSchema);