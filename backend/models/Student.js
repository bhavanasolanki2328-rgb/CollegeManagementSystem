const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rollNumber: {
        type: String,
        required: true,
        unique: true
    },
    department: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    batch: {
        type: String,
        required: true
    },
    phone: String,
    address: String,
    parentName: String,
    parentPhone: String,
    enrollmentDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Student', StudentSchema);