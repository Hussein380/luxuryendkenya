const baseTemplate = require('./base');
const { CONTACT_PHONE, CONTACT_EMAIL } = require('./base');

module.exports = (data) => ({
    subject: 'Welcome to luxuryend!',
    html: baseTemplate(`
        <h2 style="color: #1e3a5f; margin: 0 0 20px 0; font-size: 24px;">Welcome, ${data.name}! 👋</h2>
        <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            Thank you for joining <strong>luxuryend</strong>. We're excited to have you on board!
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
    `, 'Welcome to luxuryend'),
});
