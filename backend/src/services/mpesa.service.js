const axios = require('axios');
const logger = require('../utils/logger');

const MPESA_AUTH_URL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
const MPESA_STK_PUSH_URL = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

/**
 * Generate M-Pesa Access Token
 */
const generateToken = async () => {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
        logger.error('M-Pesa credentials missing');
        throw new Error('M-Pesa credentials missing');
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

    try {
        const response = await axios.get(MPESA_AUTH_URL, {
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });
        return response.data.access_token;
    } catch (error) {
        logger.error(`M-Pesa Auth Error: ${error.response?.data?.errorMessage || error.message}`);
        throw new Error('Failed to generate M-Pesa token');
    }
};

/**
 * Initiate M-Pesa STK Push
 * @param {string} phoneNumber - Customer phone number (format: 2547xxxxxxxx)
 * @param {number} amount - Amount to charge
 * @param {string} bookingId - Reference ID
 */
const initiateStkPush = async (phoneNumber, amount, bookingId) => {
    try {
        const token = await generateToken();
        const shortcode = process.env.MPESA_SHORTCODE;
        const passkey = process.env.MPESA_PASSKEY;
        const callbackUrl = process.env.MPESA_CALLBACK_URL;

        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
        const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

        // Ensure phone number is in correct format (2547xxxxxxxx)
        let formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.slice(1);
        } else if (formattedPhone.startsWith('+')) {
            formattedPhone = formattedPhone.slice(1);
        }

        const data = {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: Math.round(amount),
            PartyA: formattedPhone,
            PartyB: shortcode,
            PhoneNumber: formattedPhone,
            CallBackURL: callbackUrl,
            AccountReference: bookingId,
            TransactionDesc: `Booking ${bookingId}`,
        };

        const response = await axios.post(MPESA_STK_PUSH_URL, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        logger.info(`STK Push initiated for ${bookingId}: ${response.data.ResponseDescription}`);
        return response.data;
    } catch (error) {
        logger.error(`M-Pesa STK Push Error: ${error.response?.data?.errorMessage || error.message}`);
        throw new Error('Failed to initiate M-Pesa STK Push');
    }
};

module.exports = {
    initiateStkPush,
};
