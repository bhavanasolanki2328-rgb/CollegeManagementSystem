const express = require('express');
const Fee = require('../models/Fee');
const Student = require('../models/Student');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Create/Update fee record (Admin only)
router.post('/', protect, restrictTo(['admin']), async (req, res) => {
    try {
        const { studentId, semester, totalFee, paidAmount, paymentDetails } = req.body;
        
        let fee = await Fee.findOne({ studentId, semester });
        
        if (!fee) {
            fee = new Fee({
                studentId,
                semester,
                totalFee,
                paidAmount: 0,
                dueAmount: totalFee
            });
        }
        
        if (paymentDetails) {
            fee.paidAmount += paymentDetails.amount;
            fee.dueAmount = fee.totalFee - fee.paidAmount;
            fee.paymentHistory.push(paymentDetails);
            fee.status = fee.dueAmount === 0 ? 'paid' : fee.paidAmount > 0 ? 'partial' : 'due';
        }
        
        await fee.save();
        res.json(fee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get fee details for a student
router.get('/student/:studentId', protect, async (req, res) => {
    try {
        const fees = await Fee.find({ studentId: req.params.studentId })
            .sort({ semester: -1 });
        
        const summary = {
            totalFee: fees.reduce((sum, f) => sum + f.totalFee, 0),
            totalPaid: fees.reduce((sum, f) => sum + f.paidAmount, 0),
            totalDue: fees.reduce((sum, f) => sum + f.dueAmount, 0)
        };
        
        res.json({
            fees,
            summary
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all fee records (Admin only)
router.get('/', protect, restrictTo(['admin']), async (req, res) => {
    try {
        const fees = await Fee.find()
            .populate('studentId', 'rollNumber')
            .populate({
                path: 'studentId',
                populate: { path: 'userId', select: 'name email' }
            });
        
        res.json(fees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Record payment (Admin only)
router.post('/payment', protect, restrictTo(['admin']), async (req, res) => {
    try {
        const { studentId, semester, amount, mode, transactionId } = req.body;
        
        const fee = await Fee.findOne({ studentId, semester });
        if (!fee) {
            return res.status(404).json({ error: 'Fee record not found' });
        }
        
        const payment = {
            amount,
            mode,
            transactionId,
            receiptNumber: `RCPT-${Date.now()}`
        };
        
        fee.paidAmount += amount;
        fee.dueAmount = fee.totalFee - fee.paidAmount;
        fee.paymentHistory.push(payment);
        fee.status = fee.dueAmount === 0 ? 'paid' : fee.paidAmount > 0 ? 'partial' : 'due';
        
        await fee.save();
        res.json(fee);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;