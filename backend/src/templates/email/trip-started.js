const baseTemplate = require('./base');
const { CONTACT_PHONE } = require('./base');

module.exports = (data) => ({
    subject: `🚀 Trip Started! Enjoy your ride (#${data.bookingId})`,
    html: baseTemplate(`
        <h2 style="color: #1e3a5f; margin: 0 0 20px 0; font-size: 24px;">Trip Started! 🚀</h2>
        <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
            Hi <strong>${data.customerName}</strong>, your rental for the <strong>${data.carName}</strong> has officially started.
        </p>
        <div style="background-color: #e7f3ff; border-left: 4px solid #1e3a5f; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 8px 0; color: #1e3a5f; font-size: 15px;"><strong>Return Schedule:</strong> ${new Date(data.returnDate).toLocaleString('en-KE', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p style="margin: 8px 0; color: #1e3a5f; font-size: 15px;"><strong>Support:</strong> Call us anytime at ${CONTACT_PHONE}</p>
        </div>
        <p style="color: #6c757d; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0;">
            We wish you a smooth and pleasant journey. Drive safely!
        </p>
    `, 'Trip Started'),
});
