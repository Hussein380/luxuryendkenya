const baseTemplate = require('./base');
const ADMIN_DASHBOARD_URL = process.env.ADMIN_DASHBOARD_URL || 'https://luxuryendkenya.com/admin';

module.exports = (data) => ({
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
});
