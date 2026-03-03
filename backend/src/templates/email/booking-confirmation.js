const baseTemplate = require('./base');

module.exports = (data) => ({
    subject: `🎉 Booking Confirmed! #${data.bookingId}`,
    html: baseTemplate(`
        <h2 style="color: #28a745; margin: 0 0 20px 0; font-size: 24px;">Booking Confirmed! 🎉</h2>
        <p style="color: #495057; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
            Great news, <strong>${data.customerName}</strong>! Your booking has been confirmed and is all set.
        </p>
        <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
            <h3 style="color: #155724; margin: 0 0 15px 0; font-size: 18px;">✅ Confirmed Details</h3>
            <p style="margin: 8px 0; color: #155724; font-size: 15px;"><strong>Booking ID:</strong> <span style="font-family: monospace; font-size: 16px;">${data.bookingId}</span></p>
            <p style="margin: 8px 0; color: #155724; font-size: 15px;"><strong>Car:</strong> ${data.carName || 'N/A'}</p>
            <p style="margin: 8px 0; color: #155724; font-size: 15px;"><strong>Pickup Location:</strong> ${data.pickupLocation}</p>
            <p style="margin: 8px 0; color: #155724; font-size: 15px;"><strong>Pickup Date:</strong> ${new Date(data.pickupDate).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p style="margin: 8px 0; color: #155724; font-size: 15px;"><strong>Return Date:</strong> ${new Date(data.returnDate).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p style="margin: 8px 0; color: #155724; font-size: 15px;"><strong>Total:</strong> <span style="font-size: 18px; font-weight: 600;">KES ${data.totalPrice.toLocaleString()}</span></p>
        </div>

        ${data.paymentDetails ? `
        <div style="background-color: #f8f9fa; border: 2px solid #28a745; border-radius: 8px; padding: 25px; margin: 25px 0;">
            <h3 style="color: #28a745; margin: 0 0 20px 0; font-size: 20px; text-align: center; border-bottom: 2px solid #28a745; padding-bottom: 15px;">OFFICIAL RECEIPT</h3>
            <p style="margin: 10px 0; color: #495057; font-size: 15px;"><strong>Amount Paid:</strong> <span style="color: #28a745; font-size: 20px; font-weight: 700;">KES ${data.paymentDetails.amount.toLocaleString()}</span></p>
            <p style="margin: 10px 0; color: #495057; font-size: 15px;"><strong>M-Pesa Receipt:</strong> <span style="font-family: monospace;">${data.paymentDetails.mpesaReceiptNumber}</span></p>
            <p style="margin: 10px 0; color: #495057; font-size: 15px;"><strong>Payment Date:</strong> ${new Date(data.paymentDetails.paidAt).toLocaleString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p style="margin: 10px 0; color: #495057; font-size: 12px; text-align: center; font-style: italic;">Thank you for your payment!</p>
        </div>
        ` : ''}

        <div style="background-color: #e7f3ff; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h4 style="color: #1e3a5f; margin: 0 0 10px 0;">📍 Pickup Location</h4>
            <p style="color: #495057; margin: 0; font-size: 15px;">Eastleigh 12nd St, Sec 2, Nairobi</p>
            <a href="https://share.google/BAz0wMApv14BzE2mR" style="color: #2d5a87; text-decoration: none; font-size: 14px;">View on Google Maps →</a>
        </div>
        <p style="color: #6c757d; font-size: 14px; margin: 25px 0 0 0;">
            Please arrive 15 minutes early with your driver's license and ID. Safe travels! 🚗
        </p>
    `, 'Booking Confirmed'),
});
