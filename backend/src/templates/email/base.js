const CONTACT_PHONE = '0725675022';
const CONTACT_EMAIL = 'luxuryendkenya@gmail.com';
const LOGO_URL = process.env.LOGO_URL || 'https://luxuryendkenya.com/logo.png';

const baseTemplate = (content, title) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <!-- Header with Logo -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 30px; text-align: center;">
                            <img src="${LOGO_URL}" alt="luxuryend" style="max-width: 200px; height: auto; margin-bottom: 10px;">
                            <p style="color: #a8c5e8; margin: 8px 0 0 0; font-size: 14px;">Premium Car Rentals in Kenya</p>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            ${content}
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="color: #6c757d; margin: 0 0 10px 0; font-size: 14px;">
                                <strong>luxuryend</strong><br>
                                Eastleigh 12nd St, Sec 2, Nairobi
                            </p>
                            <p style="color: #6c757d; margin: 0; font-size: 13px;">
                                📞 ${CONTACT_PHONE} | ✉️ ${CONTACT_EMAIL}
                            </p>
                            <p style="color: #adb5bd; margin: 15px 0 0 0; font-size: 12px;">
                                This is an automated message. Please do not reply to this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

module.exports = baseTemplate;
module.exports.CONTACT_PHONE = CONTACT_PHONE;
module.exports.CONTACT_EMAIL = CONTACT_EMAIL;
