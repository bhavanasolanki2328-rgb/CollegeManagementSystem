const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    description: String,

    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },

    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },

    // ✅ NEW
    department: {
        type: String,
        required: true
    },

    semester: {
        type: Number,
        required: true
    },

    fileUrl: String,

    fileType: {
        type: String,
        enum: ['pdf', 'ppt', 'doc', 'video', 'link'],
        default: 'pdf'
    },

    uploadedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Resource', ResourceSchema);