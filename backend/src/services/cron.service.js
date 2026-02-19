const cron = require('node-cron');
const Booking = require('../models/Booking');
const { sendReturnReminder, sendOverdueAlert } = require('./email.service');

/**
 * Initialize background jobs
 */
exports.initCronJobs = () => {
    // Run every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
        try {
            console.log('Running background availability check and return reminders...');
            const now = new Date();

            // 1. Send reminders 30 mins before return time
            const reminderSlotStart = new Date(now.getTime() + (25 * 60 * 1000));
            const reminderSlotEnd = new Date(now.getTime() + (35 * 60 * 1000));

            const upcomingReturns = await Booking.find({
                status: 'active',
                returnDate: { $gte: reminderSlotStart, $lte: reminderSlotEnd },
                reminderSent: { $ne: true }
            });

            for (const booking of upcomingReturns) {
                await sendReturnReminder(booking);
                booking.reminderSent = true;
                await booking.save();
                console.log(`Sent return reminder for ${booking.bookingId}`);
            }

            // 2. Mark active bookings as overdue if past return date
            const overdueBookings = await Booking.find({
                status: 'active',
                returnDate: { $lt: now }
            });

            for (const booking of overdueBookings) {
                booking.status = 'overdue';
                await booking.save();
                console.log(`Marked booking ${booking.bookingId} as OVERDUE`);

                // Optional: Trigger an alert email to admin
                await sendOverdueAlert(booking);
            }

        } catch (error) {
            console.error('Cron Job Error:', error);
        }
    });

    console.log('Background jobs initialized.');
};
