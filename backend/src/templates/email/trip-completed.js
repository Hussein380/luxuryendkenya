const baseTemplate = require('./base');

module.exports = (data) => ({
    subject: `🏁 Trip Completed! Thank you for choosing luxuryend (#${data.bookingId})`,
    html: baseTemplate(`
        <h2 style="color: #28a745; margin: 0 0 20px 0; font-size: 24px;">Welcome Back! 🏁</h2>
        <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
            Hi <strong>${data.customerName}</strong>, thank you for returning the <strong>${data.carName}</strong>. We hope you had an excellent experience.
        </p>
        <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #1e3a5f; margin: 0 0 15px 0; font-size: 18px;">Rental Summary</h3>
            <p style="margin: 8px 0; color: #495057; font-size: 15px;"><strong>Booking ID:</strong> ${data.bookingId}</p>
            <p style="margin: 8px 0; color: #495057; font-size: 15px;"><strong>Total Price:</strong> KES ${data.totalPrice.toLocaleString()}</p>
            ${data.penaltyFee?.amount > 0 ? `
            <p style="margin: 8px 0; color: #dc3545; font-size: 15px;"><strong>Late Fee Applied:</strong> KES ${data.penaltyFee.amount.toLocaleString()} (${data.penaltyFee.reason})</p>
            ` : ''}
            <p style="margin: 8px 0; color: #28a745; font-size: 15px;"><strong>Status:</strong> COMPLETED</p>
        </div>
        <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 25px 0 0 0; text-align: center;">
            We'd love to see you again soon!
        </p>
    `, 'Trip Completed'),
});
