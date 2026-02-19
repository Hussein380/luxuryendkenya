/**
 * Direct email sending via Resend.
 * Used on Vercel (serverless) where BullMQ worker cannot run.
 */
const { Resend } = require('resend');
const logger = require('../utils/logger');

const resend = new Resend(process.env.RESEND_API_KEY);
const CONTACT_PHONE = '+254 722 235 748';
const CONTACT_EMAIL = 'soltravelgroupltd@gmail.com';

const emailTemplates = {
    welcome: (data) => ({
        subject: 'Welcome to Sol Travel Group!',
        html: `<h1>Welcome, ${data.name}!</h1><p>Thank you for joining Sol Travel Group.</p><p>Questions? Contact us: ${CONTACT_PHONE} | ${CONTACT_EMAIL}</p><p>Best regards, The Sol Travel Team</p>`,
    }),
    'booking-received': (data) => ({
        subject: `We've Received Your Booking #${data.bookingId}`,
        html: `<h1>Booking Request Received</h1><p>Hi ${data.customerName},</p><p>Thank you for your booking request.</p><p><strong>Booking ID:</strong> ${data.bookingId}</p><p><strong>Pickup:</strong> ${new Date(data.pickupDate).toLocaleDateString()} – ${new Date(data.returnDate).toLocaleDateString()}</p><p><strong>Total:</strong> KES ${data.totalPrice.toLocaleString()}</p><p>Best regards, The Sol Travel Team</p>`,
    }),
    'admin-new-booking': (data) => ({
        subject: `New Booking #${data.bookingId} – Needs Confirmation`,
        html: `<h1>New Booking Request</h1><p>Booking ID: ${data.bookingId}</p><p>Customer: ${data.customerName} | ${data.customerEmail}</p><p>Car: ${data.carName || 'N/A'}</p><p>Total: KES ${data.totalPrice.toLocaleString()}</p><p>Log in to the admin dashboard to confirm.</p>`,
    }),
    'booking-confirmation': (data) => ({
        subject: `Booking Confirmed! #${data.bookingId}`,
        html: `<h1>Booking Confirmed!</h1><p>Hi ${data.customerName},</p><p>Your booking has been confirmed.</p><p><strong>Booking ID:</strong> ${data.bookingId}</p><p><strong>Car:</strong> ${data.carName || 'N/A'}</p><p><strong>Total:</strong> KES ${data.totalPrice.toLocaleString()}</p><p>Safe travels! The Sol Travel Team</p>`,
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
    'admin-new-reservation': (data) => ({
        subject: `New Reservation Request #${data.bookingId}`,
        html: `
            <h1>New Reservation Request</h1>
            <p>A customer has requested to reserve a car.</p>
            <p><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p><strong>Customer:</strong> ${data.customerName} (${data.customerPhone || 'N/A'})</p>
            <p><strong>Email:</strong> ${data.customerEmail || 'Pervided in dashboard'}</p>
            <p><strong>Car:</strong> ${data.carName}</p>
            <p><strong>Pickup Date:</strong> ${new Date(data.pickupDate).toLocaleDateString()}</p>
            <p>Log in to the admin dashboard to review documents and confirm.</p>
        `,
    }),
};

const sendEmailDirectly = async (type, data) => {
    if (!process.env.RESEND_API_KEY) {
        logger.warn('RESEND_API_KEY not set, skipping email');
        return null;
    }
    const template = emailTemplates[type];
    if (!template) {
        logger.error(`Unknown email type: ${type}`);
        return null;
    }
    const recipient = data.to || data.email || data.customerEmail;
    if (!recipient) {
        logger.error('No recipient for email');
        return null;
    }
    try {
        const emailContent = template(data);
        const result = await resend.emails.send({
            from: 'Sol Travel Group <onboarding@resend.dev>',
            to: recipient,
            subject: emailContent.subject,
            html: emailContent.html,
        });
        logger.info(`Email sent directly: ${type} -> ${recipient}`);
        return result;
    } catch (error) {
        logger.error(`Failed to send email: ${error.message}`);
        return null;
    }
};

module.exports = {
    sendEmailDirectly,
    emailTemplates,
};
