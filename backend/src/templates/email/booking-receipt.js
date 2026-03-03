const baseTemplate = require('./base');

module.exports = (data) => ({
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
            Keep this receipt for your records. Thank you for choosing luxuryend!
        </p>
    `, 'Payment Receipt'),
});
