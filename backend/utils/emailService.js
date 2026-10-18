const { Resend } = require('resend');

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Resend] Notice: RESEND_API_KEY is not defined in environment variables.');
  }
  return new Resend(apiKey || 're_mock_key');
};

/**
 * Sends a 6-digit OTP email using Resend API
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - 6-digit numeric OTP code
 * @param {string} purpose - 'registration' | 'password_reset'
 */
async function sendOTPEmail(toEmail, otp, purpose = 'registration') {
  const purposeTitle = purpose === 'password_reset' ? 'Password Reset Code' : 'Account Verification Code';
  const actionText = purpose === 'password_reset' 
    ? 'reset your EduVibe account password' 
    : 'complete your EduVibe portal registration';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>EduVibe Verification Code</title>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e5e9f0;">
          <tr>
            <td style="padding: 30px 40px 20px 40px; background: linear-gradient(135deg, #007aff 0%, #6366f1 100%); text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">🎓 EduVibe LMS</h1>
              <p style="margin: 6px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Next-Gen Academic Learning Portal</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 35px 40px 25px 40px;">
              <h2 style="margin: 0 0 12px 0; color: #1e293b; font-size: 20px; font-weight: 700;">${purposeTitle}</h2>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px; line-height: 1.5;">
                Hello, please use the 6-digit verification code below to ${actionText}:
              </p>
              
              <div style="background-color: #f8fafc; border: 2px dashed #007aff; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #007aff; display: inline-block;">
                  ${otp}
                </span>
                <p style="margin: 8px 0 0 0; color: #64748b; font-size: 13px;">Valid for <strong>5 minutes</strong></p>
              </div>

              <p style="margin: 0 0 10px 0; color: #64748b; font-size: 13px; line-height: 1.4;">
                ⚠️ <strong>Security Notice:</strong> Never share this code with anyone. EduVibe staff will never ask for your verification code.
              </p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                If you did not request this verification, please safely disregard this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                © 2026 EduVibe Learning Management System. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    const resend = getResendClient();
    const result = await resend.emails.send({
      from: 'EduVibe <onboarding@resend.dev>',
      to: toEmail,
      subject: `[EduVibe] Your Verification Code: ${otp}`,
      html: htmlContent,
    });

    if (result.error) {
      console.warn(`[Resend Notice] Email to ${toEmail} returned note:`, result.error.message);
      // Fallback in case of unverified test domain restrictions
      return {
        success: true,
        delivered: false,
        devOtp: otp,
        warning: result.error.message,
      };
    }

    console.log(`[Resend Success] ✅ Verification email sent to ${toEmail} (ID: ${result.data?.id})`);
    return { success: true, delivered: true, id: result.data?.id };
  } catch (error) {
    console.error(`[Resend Error] Failed to send email to ${toEmail}:`, error.message);
    // Graceful fallback: return devOtp so local testing is never blocked
    return {
      success: true,
      delivered: false,
      devOtp: otp,
      warning: error.message,
    };
  }
}

module.exports = { sendOTPEmail };
