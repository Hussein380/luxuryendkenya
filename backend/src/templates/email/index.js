const welcome = require('./welcome');
const bookingReceived = require('./booking-received');
const adminNewBooking = require('./admin-new-booking');
const bookingConfirmation = require('./booking-confirmation');
const bookingReceipt = require('./booking-receipt');
const adminPaymentSuccess = require('./admin-payment-success');
const adminNewReservation = require('./admin-new-reservation');
const returnReminder = require('./return-reminder');
const overdueAlert = require('./overdue-alert');
const tripStarted = require('./trip-started');
const tripCompleted = require('./trip-completed');

module.exports = {
    welcome,
    'booking-received': bookingReceived,
    'admin-new-booking': adminNewBooking,
    'booking-confirmation': bookingConfirmation,
    'booking-receipt': bookingReceipt,
    'admin-payment-success': adminPaymentSuccess,
    'admin-new-reservation': adminNewReservation,
    'return-reminder': returnReminder,
    'overdue-alert': overdueAlert,
    'trip-started': tripStarted,
    'trip-completed': tripCompleted,
};
