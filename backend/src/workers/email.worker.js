const { Worker } = require('bullmq');
const { Resend } = require('resend');
const logger = require('../utils/logger');
const { connection } = require('../config/queue.config');

const resend = new Resend(process.env.RESEND_API_KEY);

// Contact info for emails
const CONTACT_PHONE = '0725 996 394';
const CONTACT_EMAIL = 'huznigarane@gmail.com';

// Email templates
const emailTemplates = {
    welcome: (data) => ({
        subject: 'Welcome to DriveEase! 🚗',
        html: `
            <h1>Welcome, ${data.name}!</h1>
            <p>Thank you for joining DriveEase. We're excited to have you on board.</p>
            <p>Start exploring our premium car collection and find your perfect ride.</p>
            <br/>
            <p>Questions? Contact us:<br/>📞 ${CONTACT_PHONE}<br/>✉️ ${CONTACT_EMAIL}</p>
            <p>Best regards,<br/>The DriveEase Team</p>
        `,
    }),
    'booking-confirmation': (data) => ({
        subject: `Booking Confirmed! #${data.bookingId}`,
        html: `
            <h1>Booking Confirmed!</h1>
            <p>Hi ${data.customerName},</p>
            <p>Your booking has been confirmed. Here are the details:</p>
            <ul>
                <li><strong>Booking ID:</strong> ${data.bookingId}</li>
                <li><strong>Pickup Date:</strong> ${new Date(data.pickupDate).toLocaleDateString()}</li>
                <li><strong>Return Date:</strong> ${new Date(data.returnDate).toLocaleDateString()}</li>
                <li><strong>Pickup Location:</strong> ${data.pickupLocation}</li>
            </ul>
            <p>Total: <strong>KES ${data.totalPrice.toLocaleString()}</strong></p>
            <br/>
            <p>Need help? Contact us:<br/>📞 ${CONTACT_PHONE}<br/>✉️ ${CONTACT_EMAIL}</p>
            <p>Safe travels!<br/>The DriveEase Team</p>
        `,
    }),
};

// Create the worker
const emailWorker = new Worker(
    'email',
    async (job) => {
        const { type, data } = job.data;
        logger.info(`Processing email job: ${type} for ${data.email || data.customerEmail}`);

        const template = emailTemplates[type];
        if (!template) {
            throw new Error(`Unknown email type: ${type}`);
        }

        const emailContent = template(data);

        try {
            const result = await resend.emails.send({
                from: 'DriveEase <onboarding@resend.dev>', // Use your verified domain later
                to: data.email || data.customerEmail,
                subject: emailContent.subject,
                html: emailContent.html,
            });

            logger.info(`Email sent successfully: ${result.id}`);
            return result;
        } catch (error) {
            logger.error(`Failed to send email: ${error.message}`);
            throw error;
        }
    },
    { connection }
);

emailWorker.on('completed', (job) => {
    logger.info(`Email job ${job.id} completed`);
});

emailWorker.on('failed', (job, err) => {
    logger.error(`Email job ${job.id} failed: ${err.message}`);
});

logger.info('Email Worker started');

module.exports = emailWorker;
