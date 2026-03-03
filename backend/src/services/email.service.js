/**
 * Direct email sending via Resend.
 * Used on Vercel (serverless) where BullMQ worker cannot run.
 */
const { Resend } = require('resend');
const logger = require('../utils/logger');

const resend = new Resend(process.env.RESEND_API_KEY);
const CONTACT_PHONE = '0725675022';
const CONTACT_EMAIL = 'luxuryendkenya@gmail.com';

const ADMIN_DASHBOARD_URL = process.env.ADMIN_DASHBOARD_URL || 'https://luxuryendkenya.com/admin';
const LOGO_URL = process.env.LOGO_URL || 'https://luxuryendkenya.com/logo.png';

const emailTemplates = require('../templates/email');

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
        const { data: resendData, error } = await resend.emails.send({
            from: 'luxuryend <onboarding@resend.dev>',
            to: recipient,
            subject: emailContent.subject,
            html: emailContent.html,
        });

        if (error) {
            if (error.name === 'validation_error' && error.message.includes('testing emails')) {
                logger.warn(`Resend Sandbox Limitation: Could not send email to ${recipient}. Verify domain at resend.com for production use.`);
            } else {
                logger.error(`Resend error: ${error.message} (Type: ${error.name})`);
            }
            return null;
        }

        logger.info(`Email sent directly: ${type} -> ${recipient} (ID: ${resendData?.id})`);
        return resendData;
    } catch (error) {
        logger.error(`Failed to send email: ${error.message}`);
        return null;
    }
};

const sendReturnReminder = async (booking) => {
    return sendEmailDirectly('return-reminder', {
        ...booking.toObject(),
        customerName: `${booking.firstName} ${booking.lastName}`
    });
};

const sendOverdueAlert = async (booking) => {
    return sendEmailDirectly('overdue-alert', {
        ...booking.toObject(),
        customerName: `${booking.firstName} ${booking.lastName}`
    });
};

const sendTripStartEmail = async (booking) => {
    return sendEmailDirectly('trip-started', {
        ...booking.toObject(),
        customerName: `${booking.firstName} ${booking.lastName}`,
        carName: booking.car?.name || 'N/A'
    });
};

const sendTripCompleteEmail = async (booking) => {
    return sendEmailDirectly('trip-completed', {
        ...booking.toObject(),
        customerName: `${booking.firstName} ${booking.lastName}`,
        carName: booking.car?.name || 'N/A'
    });
};

module.exports = {
    sendEmailDirectly,
    sendReturnReminder,
    sendOverdueAlert,
    sendTripStartEmail,
    sendTripCompleteEmail,
    emailTemplates,
};
