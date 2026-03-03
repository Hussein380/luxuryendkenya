const baseTemplate = require('./base');
const { CONTACT_PHONE } = require('./base');

module.exports = (data) => ({
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
});
