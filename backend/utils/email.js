require('dotenv').config();

/**
 * Send a 6-digit login OTP to the given email address.
 *
 * Strategy:
 *  1. Resend API  — used when RESEND_API_KEY is set (production/Vercel)
 *  2. Gmail SMTP  — fallback when GMAIL_USER + GMAIL_APP_PASS are set (local dev)
 *  3. Console log — last resort if no credentials are configured
 *
 * The whitelist below ensures the helper never sends to unexpected addresses.
 */
async function sendLoginOtp(toEmail, otp, name) {

  // ── Whitelist ─────────────────────────────────────────────────────────────
  const allowedEmails = [
    'sanjeevanilshukla@gmail.com',
    'anirudha.kolpyakwar@gmail.com',
    'saeebhadane9@gmail.com'
  ];

  if (!allowedEmails.includes(toEmail)) {
    console.log(`  🚫 OTP BLOCKED: ${toEmail} is not in the allowed list.\n`);
    return;
  }

  // ── Console log (always printed as server-side backup) ────────────────────
  console.log('\n' + '═'.repeat(55));
  console.log('  📧  LOGIN OTP');
  console.log('  Recipient : ' + toEmail);
  console.log('  OTP Code  : ' + otp);
  console.log('  Expires   : 10 minutes');
  console.log('═'.repeat(55) + '\n');

  // ── Email HTML body ───────────────────────────────────────────────────────
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #f8fafc; padding: 2rem; border-radius: 12px;">
      <div style="background: #1e293b; padding: 1.5rem; border-radius: 8px 8px 0 0; text-align: center;">
        <h2 style="color: #f1f5f9; margin: 0; font-size: 1.2rem;">Sandip University FAS</h2>
        <p style="color: #94a3b8; margin: 4px 0 0; font-size: 0.8rem;">Login Verification</p>
      </div>
      <div style="background: #ffffff; padding: 2rem; border-radius: 0 0 8px 8px; border: 1px solid #e2e8f0; border-top: none;">
        <p style="color: #334155;">Hello <strong>${name || 'User'}</strong>,</p>
        <p style="color: #475569; line-height: 1.6;">
          A login attempt was made to your FAS account.
          Use the code below to complete your sign-in:
        </p>
        <div style="text-align: center; margin: 2rem 0;">
          <div style="display: inline-block; background: #f1f5f9; border: 2px dashed #94a3b8; border-radius: 8px; padding: 1rem 2.5rem;">
            <span style="font-size: 2.5rem; font-weight: 800; letter-spacing: 10px; color: #0f172a; font-family: monospace;">${otp}</span>
          </div>
        </div>
        <p style="color: #64748b; font-size: 0.85rem; text-align: center;">
          ⏰ This code expires in <strong>10 minutes</strong>.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0;">
        <p style="color: #94a3b8; font-size: 0.8rem; text-align: center;">
          Do not share this code with anyone. If you did not attempt to log in, contact your administrator immediately.
        </p>
      </div>
    </div>
  `;

  // ── 1. Resend (production — tried first) ──────────────────────────────────
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    try {
      const { Resend } = require('resend');
      const resend = new Resend(resendApiKey);

      const { data, error } = await resend.emails.send({
        from: 'Sandip University FAS <onboarding@resend.dev>',
        to: toEmail,
        subject: 'Your Login Verification Code – Sandip University FAS',
        html,
      });

      if (error) {
        console.error('  ❌ Resend failed for', toEmail, ':', JSON.stringify(error));
        console.log('  → Falling back to Gmail SMTP...\n');
      } else {
        console.log(`  ✅ OTP sent via Resend to ${toEmail} (ID: ${data.id})\n`);
        return; // Success — stop here
      }
    } catch (err) {
      console.error('  ❌ Resend exception:', err.message);
      console.log('  → Falling back to Gmail SMTP...\n');
    }
  }

  // ── 2. Gmail SMTP via Nodemailer (fallback) ───────────────────────────────
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASS;

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
        subject: 'Your Login Verification Code – Sandip University FAS',
        html,
      });

      console.log(`  ✅ OTP sent via Gmail SMTP to ${toEmail} (ID: ${info.messageId})\n`);
      return;
    } catch (err) {
      console.error('  ❌ Gmail SMTP failed:', err.message, '\n');
    }
  }

  // ── 3. No credentials — OTP is already logged to console above ───────────
  console.log('  ⚠️  No email credentials configured. OTP is shown in the server console above.\n');
}

module.exports = { sendLoginOtp };
