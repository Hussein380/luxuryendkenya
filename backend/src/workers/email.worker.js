const { Worker } = require('bullmq');
const { Resend } = require('resend');
const logger = require('../utils/logger');
const { connection } = require('../config/queue.config');
const { emailTemplates } = require('../services/email.service');

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

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
            const { data: resendData, error } = await resend.emails.send({
                from: 'Sol Travel Group <onboarding@resend.dev>', // Use your verified domain later
                to: recipient,
                subject: emailContent.subject,
                html: emailContent.html,
            });

            if (error) {
                logger.error(`Resend error: ${error.message} (Type: ${error.name})`);
                throw new Error(error.message);
            }

            logger.info(`Email sent successfully: ${resendData?.id}`);
            return resendData;
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
