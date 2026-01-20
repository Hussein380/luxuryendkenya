const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');

// Load env vars
dotenv.config();

const createAdmin = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const adminEmail = 'huznigarane7@gmail.com';
        const adminPassword = 'hzg@746789';
        const adminName = 'System Owner';

        // Check if user exists
        let user = await User.findOne({ email: adminEmail });

        if (user) {
            console.log(`User ${adminEmail} already exists. Promoting to admin...`);
            user.role = 'admin';
            user.password = adminPassword; // Update password as requested
            await user.save();
            console.log('✅ User successfully promoted/updated to Admin');
        } else {
            console.log(`Creating new Admin user: ${adminEmail}...`);
            user = await User.create({
                name: adminName,
                email: adminEmail,
                password: adminPassword,
                role: 'admin'
            });
            console.log('✅ New Admin user successfully created');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();
