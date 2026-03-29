const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeId: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: String,
        required: true
    },
    designation: String,
    qualification: String,
    specialization: String,
    phone: String,
    joiningDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Teacher', TeacherSchema);