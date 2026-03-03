const baseTemplate = require('./base');
const ADMIN_DASHBOARD_URL = process.env.ADMIN_DASHBOARD_URL || 'https://luxuryendkenya.com/admin';

module.exports = (data) => ({
    subject: `💰 Payment Received! #${data.bookingId}`,
    html: baseTemplate(`
        <h2 style="color: #28a745; margin: 0 0 20px 0; font-size: 24px;">New Payment Received! 💰</h2>
        <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
            A new M-Pesa payment has been successfully processed.
        </p>
        <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #155724; margin: 0 0 15px 0; font-size: 18px;">Payment Details</h3>
            <p style="margin: 8px 0; color: #155724; font-size: 15px;"><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p style="margin: 8px 0; color: #155724; font-size: 15px;"><strong>Customer:</strong> ${data.customerName}</p>
            <p style="margin: 8px 0; color: #155724; font-size: 15px;"><strong>Car:</strong> ${data.carName}</p>
            <p style="margin: 8px 0; color: #155724; font-size: 15px;"><strong>Amount Paid:</strong> KES ${data.amount.toLocaleString()}</p>
            <p style="margin: 8px 0; color: #155724; font-size: 15px;"><strong>M-Pesa Receipt:</strong> <span style="font-family: monospace;">${data.mpesaReceiptNumber}</span></p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${ADMIN_DASHBOARD_URL}" style="display: inline-block; background: linear-gradient(135deg, #28a745 0%, #218838 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">View Dashboard</a>
        </div>
    `, 'New Payment Received'),
});
