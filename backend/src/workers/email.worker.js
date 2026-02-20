const { Worker } = require('bullmq');
const { Resend } = require('resend');
const logger = require('../utils/logger');
const { connection } = require('../config/queue.config');

const resend = new Resend(process.env.RESEND_API_KEY);

// Contact info for emails
const CONTACT_PHONE = '+254 722 235 748';
const CONTACT_EMAIL = 'soltravelgroupltd@gmail.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// Email templates
const emailTemplates = {
    welcome: (data) => ({
        subject: 'Welcome to Sol Travel Group! 🚗',
        html: `
            <h1>Welcome, ${data.name}!</h1>
            <p>Thank you for joining Sol Travel Group. We're excited to have you on board.</p>
            <p>Start exploring our premium car collection and find your perfect ride.</p>
            <br/>
            <p>Questions? Contact us:<br/>📞 ${CONTACT_PHONE}<br/>✉️ ${CONTACT_EMAIL}</p>
            <p>Best regards,<br/>The Sol Travel Team</p>
        `,
    }),
    'booking-received': (data) => ({
        subject: `We've Received Your Booking #${data.bookingId}`,
        html: `
            <h1>Booking Request Received</h1>
            <p>Hi ${data.customerName},</p>
            <p>Thank you for your booking request. We've received it and will confirm shortly.</p>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            <ul>
                <li><strong>Pickup Date:</strong> ${new Date(data.pickupDate).toLocaleDateString()}</li>
                <li><strong>Return Date:</strong> ${new Date(data.returnDate).toLocaleDateString()}</li>
                <li><strong>Pickup Location:</strong> ${data.pickupLocation}</li>
            </ul>
            <p>Total: <strong>KES ${data.totalPrice.toLocaleString()}</strong></p>
            <br/>
            <p>We'll send you a confirmation email once your booking is approved.</p>
            <p>Questions? Contact us:<br/>📞 ${CONTACT_PHONE}<br/>✉️ ${CONTACT_EMAIL}</p>
            <p>Best regards,<br/>The Sol Travel Team</p>
        `,
    }),
    'admin-new-booking': (data) => ({
        subject: `New Booking #${data.bookingId} – Needs Confirmation`,
        html: `
            <h1>New Booking Request</h1>
            <p>A customer has submitted a booking that needs your confirmation.</p>
            <ul>
                <li><strong>Booking ID:</strong> ${data.bookingId}</li>
                <li><strong>Customer:</strong> ${data.customerName}</li>
                <li><strong>Email:</strong> ${data.customerEmail}</li>
                <li><strong>Phone:</strong> ${data.customerPhone}</li>
                <li><strong>Car:</strong> ${data.carName || 'N/A'}</li>
                <li><strong>Pickup:</strong> ${new Date(data.pickupDate).toLocaleDateString()} – ${new Date(data.returnDate).toLocaleDateString()}</li>
                <li><strong>Location:</strong> ${data.pickupLocation}</li>
                <li><strong>Total:</strong> KES ${data.totalPrice.toLocaleString()}</li>
            </ul>
            <p><strong>Log in to the admin dashboard to confirm this booking.</strong></p>
            <p>Best regards,<br/>Sol Travel System</p>
        `,
    }),
    'booking-confirmation': (data) => ({
        subject: `Booking Confirmed! #${data.bookingId}`,
        html: `
            <h1>Booking Confirmed!</h1>
            <p>Hi ${data.customerName},</p>
            <p>Great news! Your booking has been confirmed. Here are the details:</p>
            <ul>
                <li><strong>Booking ID:</strong> ${data.bookingId}</li>
                <li><strong>Car:</strong> ${data.carName || 'N/A'}</li>
                <li><strong>Pickup Date:</strong> ${new Date(data.pickupDate).toLocaleDateString()}</li>
                <li><strong>Return Date:</strong> ${new Date(data.returnDate).toLocaleDateString()}</li>
                <li><strong>Pickup Location:</strong> ${data.pickupLocation}</li>
            </ul>
            <p>Total: <strong>KES ${data.totalPrice.toLocaleString()}</strong></p>
            <br/>
            <p>Need help? Contact us:<br/>📞 ${CONTACT_PHONE}<br/>✉️ ${CONTACT_EMAIL}</p>
            <p>Safe travels!<br/>The Sol Travel Team</p>
        `,
    }),
    'admin-new-reservation': (data) => ({
        subject: `New Reservation Request #${data.bookingId}`,
        html: `
            <h1>New Reservation Request</h1>
            <p>A customer has requested to reserve a car.</p>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p><strong>Customer:</strong> ${data.customerName} (${data.customerPhone || 'N/A'})</p>
            <p><strong>Email:</strong> ${data.customerEmail || 'Provided in dashboard'}</p>
            <p><strong>Car:</strong> ${data.carName}</p>
            <p><strong>Pickup Date:</strong> ${new Date(data.pickupDate).toLocaleDateString()}</p>
            <p>Log in to the admin dashboard to review documents and confirm.</p>
        `,
    }),
    'booking-receipt': (data) => ({
        subject: `Payment Receipt for Booking #${data.bookingId}`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                <h1 style="color: #4CAF50;">Payment Received!</h1>
                <p>Hi ${data.customerName},</p>
                <p>Thank you for your payment. Here is your receipt for your car booking.</p>
                <hr />
                <p><strong>Booking ID:</strong> ${data.bookingId}</p>
                <p><strong>Car:</strong> ${data.carName}</p>
                <p><strong>Amount Paid:</strong> KES ${data.amount.toLocaleString()}</p>
                <p><strong>Receipt Number:</strong> ${data.receiptNumber}</p>
                <p><strong>Date:</strong> ${new Date(data.paidAt).toLocaleString()}</p>
                <hr />
                <p>If you have any questions, please contact our support.</p>
                <p>Best regards,<br>The Sol Travel Team</p>
            </div>
        `,
    }),
};

// Create the worker
const emailWorker = new Worker(
    'email',
    async (job) => {
        const { type, data } = job.data;
        logger.info(`Processing email job: ${type} for ${data.to || data.email || data.customerEmail}`);

        const template = emailTemplates[type];
        if (!template) {
            throw new Error(`Unknown email type: ${type}`);
        }

        const emailContent = template(data);

        // Use data.to for admin emails, otherwise customer email
        const recipient = data.to || data.email || data.customerEmail;

        try {
            const result = await resend.emails.send({
                from: 'Sol Travel Group <onboarding@resend.dev>', // Use your verified domain later
                to: recipient,
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
