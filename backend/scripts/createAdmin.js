const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

const createAdmin = async () => {
    try {
        await connectDB();
        
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@college.com' });
        
        if (existingAdmin) {
            console.log('Admin user already exists!');
            process.exit(0);
        }
        
        // Create admin user
        const admin = new User({
            name: 'Admin User',
            email: 'admin@college.com',
            password: 'admin123',
            role: 'admin'
        });
        
        await admin.save();
        console.log('Admin user created successfully!');
        console.log('Email: admin@college.com');
        console.log('Password: admin123');
        
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();