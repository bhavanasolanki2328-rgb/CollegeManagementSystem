const mongoose = require('mongoose');

const FeeSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    totalFee: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    dueAmount: {
        type: Number,
        default: 0
    },
    paymentHistory: [{
        amount: Number,
        date: {
            type: Date,
            default: Date.now
        },
        mode: String,
        transactionId: String,
        receiptNumber: String
    }],
    status: {
        type: String,
        enum: ['paid', 'partial', 'due'],
        default: 'due'
    }
});

module.exports = mongoose.model('Fee', FeeSchema);