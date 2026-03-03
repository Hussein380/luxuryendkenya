const baseTemplate = require('./base');
const { CONTACT_PHONE } = require('./base');

module.exports = (data) => ({
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
        <p style="color: #dc3545; font-size: 15px; margin: 25px 0 0 0; text-align: center;">
            <strong>If you're having trouble returning the car, contact us immediately:</strong><br>
            <a href="tel:${CONTACT_PHONE}" style="color: #dc3545; font-size: 18px; text-decoration: none;">${CONTACT_PHONE}</a>
        </p>
    `, 'Booking Overdue'),
});
