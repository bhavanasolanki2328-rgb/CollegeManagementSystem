const express = require('express');
const Announcement = require('../models/Announcement');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Get announcements (for all users)
router.get('/', protect, async (req, res) => {
    try {
        const query = {
            $or: [
                { expiresAt: { $gt: new Date() } },
                { expiresAt: null }
            ]
        };
        
        const announcements = await Announcement.find(query)
            .populate('createdBy', 'name role')
            .sort({ pinned: -1, createdAt: -1 })
            .limit(20);
        
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create announcement (admin/teacher)
router.post('/', protect, restrictTo('admin', 'teacher'), async (req, res) => {
    try {
        const announcement = new Announcement({
            ...req.body,
            createdBy: req.user._id
        });
        
        await announcement.save();
        res.status(201).json(announcement);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete announcement (admin only)
router.delete('/:id', protect, restrictTo('admin'), async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ message: 'Announcement deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;