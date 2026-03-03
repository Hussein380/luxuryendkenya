const baseTemplate = require('./base');

module.exports = (data) => ({
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
});
