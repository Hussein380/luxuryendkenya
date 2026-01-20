require('dotenv').config();
const mongoose = require('mongoose');

console.log('Attempting to connect to MongoDB...');
console.log('URI:', process.env.MONGODB_URI.replace(/:([^@]+)@/, ':****@')); // Hide password in logs

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB Connection Successful!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Failed!');
        console.error(err);
        process.exit(1);
    });
