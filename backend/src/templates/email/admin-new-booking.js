const baseTemplate = require('./base');
const ADMIN_DASHBOARD_URL = process.env.ADMIN_DASHBOARD_URL || 'https://luxuryendkenya.com/admin';

module.exports = (data) => ({
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
});
