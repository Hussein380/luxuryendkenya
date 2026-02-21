/**
 * Direct email sending via Resend.
 * Used on Vercel (serverless) where BullMQ worker cannot run.
 */
const { Resend } = require('resend');
const logger = require('../utils/logger');

const resend = new Resend(process.env.RESEND_API_KEY);
const CONTACT_PHONE = '+254 722 235 748';
const CONTACT_EMAIL = 'soltravelgroupltd@gmail.com';

const ADMIN_DASHBOARD_URL = process.env.ADMIN_DASHBOARD_URL || 'https://soltravel.com/admin';
const LOGO_URL = process.env.LOGO_URL || 'https://soltravel.com/logo.png';

const baseTemplate = (content, title) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Header with Logo -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 30px; text-align: center;">
                            <img src="${LOGO_URL}" alt="Sol Travel Group" style="max-width: 200px; height: auto; margin-bottom: 10px;">
                            <p style="color: #a8c5e8; margin: 8px 0 0 0; font-size: 14px;">Premium Car Rentals in Kenya</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            ${content}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="color: #6c757d; margin: 0 0 10px 0; font-size: 14px;">
                                <strong>Sol Travel Group</strong><br>
                                Eastleigh 12nd St, Sec 2, Nairobi
                            </p>
                            <p style="color: #6c757d; margin: 0; font-size: 13px;">
                                📞 ${CONTACT_PHONE} | ✉️ ${CONTACT_EMAIL}
                            </p>
                            <p style="color: #adb5bd; margin: 15px 0 0 0; font-size: 12px;">
                                This is an automated message. Please do not reply to this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

const emailTemplates = {
    welcome: (data) => ({
        subject: 'Welcome to Sol Travel Group!',
        html: baseTemplate(`
            <h2 style="color: #1e3a5f; margin: 0 0 20px 0; font-size: 24px;">Welcome, ${data.name}! 👋</h2>
            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for joining <strong>Sol Travel Group</strong>. We're excited to have you on board!
            </p>
            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Start exploring our premium car collection and find your perfect ride for your next adventure in Kenya.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://soltravelgroup.com/cars" style="display: inline-block; background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Browse Cars</a>
            </div>
            <p style="color: #6c757d; font-size: 14px; margin: 30px 0 0 0;">
                Questions? Contact us at <a href="tel:${CONTACT_PHONE}" style="color: #2d5a87; text-decoration: none;">${CONTACT_PHONE}</a> or <a href="mailto:${CONTACT_EMAIL}" style="color: #2d5a87; text-decoration: none;">${CONTACT_EMAIL}</a>
            </p>
        `, 'Welcome to Sol Travel Group'),
    }),
    'booking-received': (data) => ({
        subject: `✅ We've Received Your Booking #${data.bookingId}`,
        html: baseTemplate(`
            <h2 style="color: #1e3a5f; margin: 0 0 20px 0; font-size: 24px;">Booking Request Received! 🎉</h2>
            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Hi <strong>${data.customerName}</strong>, thank you for your booking request. We've received it and will confirm shortly.
            </p>
            <div style="background-color: #f8f9fa; border-left: 4px solid #2d5a87; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #1e3a5f; margin: 0 0 15px 0; font-size: 18px;">Booking Details</h3>
                <p style="margin: 8px 0; color: #495057; font-size: 15px;"><strong>Booking ID:</strong> <span style="color: #2d5a87; font-family: monospace; font-size: 16px;">${data.bookingId}</span></p>
                <p style="margin: 8px 0; color: #495057; font-size: 15px;"><strong>Pickup:</strong> ${new Date(data.pickupDate).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p style="margin: 8px 0; color: #495057; font-size: 15px;"><strong>Return:</strong> ${new Date(data.returnDate).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p style="margin: 8px 0; color: #495057; font-size: 15px;"><strong>Total:</strong> <span style="color: #28a745; font-size: 18px; font-weight: 600;">KES ${data.totalPrice.toLocaleString()}</span></p>
            </div>
            <p style="color: #6c757d; font-size: 14px; margin: 25px 0 0 0;">
                We'll send you a confirmation email once your booking is approved. If you have any questions, please don't hesitate to contact us.
            </p>
        `, 'Booking Request Received'),
    }),
    'admin-new-booking': (data) => ({
        subject: `🔔 New Booking #${data.bookingId} – Action Required`,
        html: baseTemplate(`
            <h2 style="color: #1e3a5f; margin: 0 0 20px 0; font-size: 24px;">New Booking Request 🔔</h2>
            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                A new booking requires your confirmation.
            </p>
            <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">⚠️ Action Required</h3>
                <p style="margin: 8px 0; color: #856404; font-size: 15px;"><strong>Booking ID:</strong> ${data.bookingId}</p>
                <p style="margin: 8px 0; color: #856404; font-size: 15px;"><strong>Customer:</strong> ${data.customerName}</p>
                <p style="margin: 8px 0; color: #856404; font-size: 15px;"><strong>Email:</strong> ${data.customerEmail}</p>
                <p style="margin: 8px 0; color: #856404; font-size: 15px;"><strong>Car:</strong> ${data.carName || 'N/A'}</p>
                <p style="margin: 8px 0; color: #856404; font-size: 15px;"><strong>Total:</strong> KES ${data.totalPrice.toLocaleString()}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${ADMIN_DASHBOARD_URL}" style="display: inline-block; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">👉 Login to Confirm</a>
            </div>
            <p style="color: #6c757d; font-size: 13px; margin: 20px 0 0 0; text-align: center;">
                Click the button above to access the admin dashboard and confirm this booking.
            </p>
        `, 'New Booking - Action Required'),
    }),
    'booking-confirmation': (data) => ({
        subject: `🎉 Booking Confirmed! #${data.bookingId}`,
        html: baseTemplate(`
            <h2 style="color: #28a745; margin: 0 0 20px 0; font-size: 24px;">Booking Confirmed! 🎉</h2>
            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Great news, <strong>${data.customerName}</strong>! Your booking has been confirmed and is all set.
            </p>
            <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #155724; margin: 0 0 15px 0; font-size: 18px;">✅ Confirmed Details</h3>
                <p style="margin: 8px 0; color: #155724; font-size: 15px;"><strong>Booking ID:</strong> <span style="font-family: monospace; font-size: 16px;">${data.bookingId}</span></p>
                <p style="margin: 8px 0; color: #155724; font-size: 15px;"><strong>Car:</strong> ${data.carName || 'N/A'}</p>
                <p style="margin: 8px 0; color: #155724; font-size: 15px;"><strong>Pickup Location:</strong> ${data.pickupLocation}</p>
                <p style="margin: 8px 0; color: #155724; font-size: 15px;"><strong>Pickup Date:</strong> ${new Date(data.pickupDate).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                <p style="margin: 8px 0; color: #155724; font-size: 15px;"><strong>Return Date:</strong> ${new Date(data.returnDate).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                <p style="margin: 8px 0; color: #155724; font-size: 15px;"><strong>Total:</strong> <span style="font-size: 18px; font-weight: 600;">KES ${data.totalPrice.toLocaleString()}</span></p>
            </div>

            ${data.paymentDetails ? `
            <div style="background-color: #f8f9fa; border: 2px solid #28a745; border-radius: 8px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #28a745; margin: 0 0 20px 0; font-size: 20px; text-align: center; border-bottom: 2px solid #28a745; padding-bottom: 15px;">OFFICIAL RECEIPT</h3>
                <p style="margin: 10px 0; color: #495057; font-size: 15px;"><strong>Amount Paid:</strong> <span style="color: #28a745; font-size: 20px; font-weight: 700;">KES ${data.paymentDetails.amount.toLocaleString()}</span></p>
                <p style="margin: 10px 0; color: #495057; font-size: 15px;"><strong>M-Pesa Receipt:</strong> <span style="font-family: monospace;">${data.paymentDetails.mpesaReceiptNumber}</span></p>
                <p style="margin: 10px 0; color: #495057; font-size: 15px;"><strong>Payment Date:</strong> ${new Date(data.paymentDetails.paidAt).toLocaleString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                <p style="margin: 10px 0; color: #495057; font-size: 12px; text-align: center; font-style: italic;">Thank you for your payment!</p>
            </div>
            ` : ''}

            <div style="background-color: #e7f3ff; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h4 style="color: #1e3a5f; margin: 0 0 10px 0;">📍 Pickup Location</h4>
                <p style="color: #495057; margin: 0; font-size: 15px;">Eastleigh 12nd St, Sec 2, Nairobi</p>
                <a href="https://share.google/BAz0wMApv14BzE2mR" style="color: #2d5a87; text-decoration: none; font-size: 14px;">View on Google Maps →</a>
            </div>
            <p style="color: #6c757d; font-size: 14px; margin: 25px 0 0 0;">
                Please arrive 15 minutes early with your driver's license and ID. Safe travels! 🚗
            </p>
        `, 'Booking Confirmed'),
    }),
    'booking-receipt': (data) => ({
        subject: `🧾 Payment Receipt for Booking #${data.bookingId}`,
        html: baseTemplate(`
            <h2 style="color: #28a745; margin: 0 0 20px 0; font-size: 24px;">Payment Received! 🧾</h2>
            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Hi <strong>${data.customerName}</strong>, thank you for your payment. Here is your official receipt.
            </p>
            <div style="background-color: #f8f9fa; border: 2px solid #28a745; border-radius: 8px; padding: 25px; margin: 25px 0;">
                <h3 style="color: #28a745; margin: 0 0 20px 0; font-size: 20px; text-align: center; border-bottom: 2px solid #28a745; padding-bottom: 15px;">OFFICIAL RECEIPT</h3>
                <p style="margin: 10px 0; color: #495057; font-size: 15px;"><strong>Booking ID:</strong> ${data.bookingId}</p>
                <p style="margin: 10px 0; color: #495057; font-size: 15px;"><strong>Car:</strong> ${data.carName}</p>
                <p style="margin: 10px 0; color: #495057; font-size: 15px;"><strong>Amount Paid:</strong> <span style="color: #28a745; font-size: 20px; font-weight: 700;">KES ${data.amount.toLocaleString()}</span></p>
                <p style="margin: 10px 0; color: #495057; font-size: 15px;"><strong>Receipt Number:</strong> <span style="font-family: monospace;">${data.receiptNumber}</span></p>
                <p style="margin: 10px 0; color: #495057; font-size: 15px;"><strong>Payment Date:</strong> ${new Date(data.paidAt).toLocaleString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <p style="color: #6c757d; font-size: 14px; margin: 25px 0 0 0; text-align: center;">
                Keep this receipt for your records. Thank you for choosing Sol Travel Group!
            </p>
        `, 'Payment Receipt'),
    }),
    'admin-new-reservation': (data) => ({
        subject: `📋 New Reservation Request #${data.bookingId}`,
        html: baseTemplate(`
            <h2 style="color: #1e3a5f; margin: 0 0 20px 0; font-size: 24px;">New Reservation Request 📋</h2>
            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                A customer has requested to reserve a car and requires document review.
            </p>
            <div style="background-color: #e7f3ff; border-left: 4px solid #0066cc; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                <h3 style="color: #004085; margin: 0 0 15px 0; font-size: 18px;">Customer Details</h3>
                <p style="margin: 8px 0; color: #004085; font-size: 15px;"><strong>Booking ID:</strong> ${data.bookingId}</p>
                <p style="margin: 8px 0; color: #004085; font-size: 15px;"><strong>Customer:</strong> ${data.customerName}</p>
                <p style="margin: 8px 0; color: #004085; font-size: 15px;"><strong>Phone:</strong> ${data.customerPhone || 'N/A'}</p>
                <p style="margin: 8px 0; color: #004085; font-size: 15px;"><strong>Email:</strong> ${data.customerEmail || 'Provided in dashboard'}</p>
                <p style="margin: 8px 0; color: #004085; font-size: 15px;"><strong>Car:</strong> ${data.carName}</p>
                <p style="margin: 8px 0; color: #004085; font-size: 15px;"><strong>Pickup Date:</strong> ${new Date(data.pickupDate).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 15px; margin: 25px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px;">
                    <strong>⚠️ Action Required:</strong> Please review the customer's uploaded documents (ID and Driver's License) before confirming this reservation.
                </p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${ADMIN_DASHBOARD_URL}" style="display: inline-block; background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">👉 Review & Confirm</a>
            </div>
        `, 'New Reservation Request'),
    }),
    'return-reminder': (data) => ({
        subject: `⏰ Reminder: Car Return in 30 Minutes (#${data.bookingId})`,
        html: baseTemplate(`
            <h2 style="color: #1e3a5f; margin: 0 0 20px 0; font-size: 24px;">Return Reminder ⏰</h2>
            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Hi <strong>${data.customerName}</strong>, we hope you've enjoyed your ride!
            </p>
            <div style="background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h3 style="color: #856404; margin: 0 0 15px 0; font-size: 18px;">⏰ 30 Minutes Remaining</h3>
                <p style="color: #856404; font-size: 15px; line-height: 1.6; margin: 0;">
                    Your rental period for the <strong>${data.carName}</strong> ends in <strong>30 minutes</strong>.
                </p>
                <p style="color: #856404; font-size: 15px; margin: 15px 0 0 0;">
                    <strong>Return by:</strong> ${new Date(data.returnDate).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </p>
            </div>
            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h4 style="color: #1e3a5f; margin: 0 0 10px 0;">📍 Return Location</h4>
                <p style="color: #495057; margin: 0; font-size: 15px;"><strong>Eastleigh 12nd St, Sec 2, Nairobi</strong></p>
                <p style="color: #dc3545; font-size: 14px; margin: 10px 0 0 0;">
                    <strong>⚠️ Late fees apply after return time.</strong>
                </p>
            </div>
            <p style="color: #6c757d; font-size: 14px; margin: 25px 0 0 0;">
                Safe travels! If you need assistance, call us at ${CONTACT_PHONE}.
            </p>
        `, 'Return Reminder'),
    }),
    'overdue-alert': (data) => ({
        subject: `🚨 URGENT: Car Return Overdue (#${data.bookingId})`,
        html: baseTemplate(`
            <h2 style="color: #dc3545; margin: 0 0 20px 0; font-size: 24px;">Booking Overdue 🚨</h2>
            <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Hi <strong>${data.customerName}</strong>, your return time has passed.
            </p>
            <div style="background-color: #f8d7da; border: 2px solid #dc3545; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h3 style="color: #721c24; margin: 0 0 15px 0; font-size: 20px;">🚨 Immediate Action Required</h3>
                <p style="color: #721c24; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0;">
                    Your return time for the <strong>${data.carName}</strong> was at <strong>${new Date(data.returnDate).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: true })}</strong>.
                </p>
                <p style="color: #721c24; font-size: 15px; margin: 0;">
                    <strong>Please return the vehicle immediately to avoid additional charges.</strong>
                </p>
            </div>
            <div style="background-color: #fff3cd; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h4 style="color: #856404; margin: 0 0 10px 0;">📍 Return Location</h4>
                <p style="color: #856404; margin: 0; font-size: 15px;"><strong>Eastleigh 12nd St, Sec 2, Nairobi</strong></p>
            </div>
            <div style="background-color: #f8d7da; border-radius: 8px; padding: 15px; margin: 25px 0;">
                <p style="color: #721c24; margin: 0; font-size: 14px;">
                    <strong>💰 Late Fee Notice:</strong> Your booking is now in a penalty period (>1 hour late). Additional charges will apply upon check-in.
                </p>
            </div>
            <p style="color: #dc3545; font-size: 15px; margin: 25px 0 0 0; text-align: center;">
                <strong>If you're having trouble returning the car, contact us immediately:</strong><br>
                <a href="tel:${CONTACT_PHONE}" style="color: #dc3545; font-size: 18px; text-decoration: none;">${CONTACT_PHONE}</a>
            </p>
        `, 'Booking Overdue'),
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
        const { data: resendData, error } = await resend.emails.send({
            from: 'Sol Travel Group <onboarding@resend.dev>',
            to: recipient,
            subject: emailContent.subject,
            html: emailContent.html,
        });

        if (error) {
            logger.error(`Resend error: ${error.message} (Type: ${error.name})`);
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

module.exports = {
    sendEmailDirectly,
    sendReturnReminder,
    sendOverdueAlert,
    emailTemplates,
};
