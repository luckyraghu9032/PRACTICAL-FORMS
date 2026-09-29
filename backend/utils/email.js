require('dotenv').config();

// Debug: confirm env vars are loaded
console.log('  ðŸ“¬ Email config check:');
console.log('     NODE_ENV       :', process.env.NODE_ENV || 'development');
console.log('     RESEND_API_KEY :', process.env.RESEND_API_KEY ? `âœ… SET` : 'âŒ NOT SET');
console.log('     GMAIL_USER     :', process.env.GMAIL_USER || 'âŒ NOT SET');
console.log('     GMAIL_APP_PASS :', process.env.GMAIL_APP_PASS ? `âœ… SET (${process.env.GMAIL_APP_PASS.length} chars)` : 'âŒ NOT SET');

/**
 * Send a 6-digit login OTP to the student's email.
 *
 * Strategy:
 *  - Production (Vercel): uses Resend HTTPS API (SMTP is blocked on Vercel)
 *  - Local development: uses Gmail SMTP via Nodemailer (free, any recipient)
 *
 * Falls back to console-only logging if no credentials are configured.
 */
async function sendLoginOtp(toEmail, otp, name) {
  // Whitelist to restrict OTP emails
  const allowedEmails = [
    'rahulpatil@sandipuniversity.edu.in',
    'anirudh.kolpyakwar@sandipuniversity.edu.in',
    'raghurag172@gmail.com'
  ];

  if (!allowedEmails.includes(toEmail)) {
    console.log(`  🚫 LOGIN OTP BLOCKED: ${toEmail} is not in the allowed emails list.\n`);
    return;
  }

  // Always print OTP to console as backup
  console.log('\n' + 'â•'.repeat(55));
  console.log('  ðŸ“§  LOGIN OTP');
  console.log('  Recipient : ' + toEmail);
  console.log('  OTP Code  : ' + otp);
  console.log('  Expires   : 10 minutes');
  console.log('â•'.repeat(55) + '\n');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f8fafc; padding: 2rem; border-radius: 12px;">
      <div style="background: #1e293b; padding: 1.5rem; border-radius: 8px 8px 0 0; text-align: center;">
        <h2 style="color: #f1f5f9; margin: 0; font-size: 1.2rem;">Sandip University FAS</h2>
        <p style="color: #94a3b8; margin: 4px 0 0; font-size: 0.8rem;">Login Verification</p>
      </div>
      <div style="background: #ffffff; padding: 2rem; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none;">
        <p style="color: #334155;">Hello <strong>${name || 'Student'}</strong>,</p>
        <p style="color: #475569; line-height: 1.6;">
          A login attempt was made to your FAS Student account.
          Use the code below to complete your sign-in:
        </p>
        <div style="text-align: center; margin: 2rem 0;">
          <div style="display: inline-block; background: #f1f5f9; border: 2px dashed #94a3b8; border-radius: 8px; padding: 1rem 2.5rem;">
            <span style="font-size: 2.5rem; font-weight: 800; letter-spacing: 10px; color: #0f172a; font-family: monospace;">${otp}</span>
          </div>
        </div>
        <p style="color: #64748b; font-size: 0.85rem; text-align: center;">
          â° This code expires in <strong>10 minutes</strong>.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0;">
        <p style="color: #94a3b8; font-size: 0.8rem; text-align: center;">
          If you did not attempt to log in, please contact your administrator immediately.
        </p>
      </div>
    </div>
  `;

  // ==========================================
  // Production Email sending via Resend API (Vercel)
  // ==========================================
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const { Resend } = require('resend');
      const resend = new Resend(resendApiKey);

      const { data, error } = await resend.emails.send({
        from: 'Sandip University FAS <onboarding@resend.dev>', // Update this when you have a verified domain
        to: toEmail,
        subject: 'Your Login Verification Code - Sandip University FAS',
        html,
      });

      if (error) {
        console.error('  Resend API failed:', error.message, '\n');
      } else {
        console.log('  Login OTP sent via Resend to ' + toEmail + ' (ID: ' + data.id + ')\n');
        return; // Success, skip other methods
      }
    } catch (err) {
      console.error('  Resend send exception:', err.message, '\n');
    }
  }
  // â”€â”€ Email sending via Gmail SMTP (Nodemailer) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASS;

  // Inline diagnostics (visible in Vercel request logs)
  console.log('  [EMAIL DIAG] GMAIL_USER     :', gmailUser || 'âŒ NOT SET');
  console.log('  [EMAIL DIAG] GMAIL_APP_PASS :', gmailPass ? `âœ… SET (${gmailPass.length} chars, first: "${gmailPass[0]}", last: "${gmailPass[gmailPass.length-1]}")` : 'âŒ NOT SET');

  if (gmailUser && gmailPass && gmailPass !== 'your_gmail_app_password') {
    try {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: gmailUser, pass: gmailPass },
      });

      const info = await transporter.sendMail({
        from: `"Sandip University FAS" <${gmailUser}>`,
        to: toEmail,
        subject: 'Your Login Verification Code - Sandip University FAS',
        html,
      });

      console.log(`  âœ… Login OTP sent via Gmail to ${toEmail} (ID: ${info.messageId})\n`);
    } catch (err) {
      console.error('  âŒ Gmail send failed:', err.message, '\n');
    }
    return;
  }

  // â”€â”€ No credentials configured â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  console.log('  âš ï¸  DEV MODE: No email credentials set. OTP is in the console above.\n');
}

module.exports = { sendLoginOtp };

