const nodemailer = require('nodemailer');

// Configure Brevo Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_FROM || 'suganth2501@gmail.com';
const senderName = process.env.BREVO_SENDER_NAME || 'Sugan Resume Analyzer Team';

/**
   * Helper to send an HTML email
   */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to,
      subject,
      html
    });
    console.log(`Email successfully sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Nodemailer send email failure:', error);
    return { success: false, error: error.message };
  }
};

/**
   * Welcome Email for new users
   */
const sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0b0f19; color: #f1f5f9; border-radius: 12px; border: 1px solid #1e293b;">
      <div style="text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px;">
        <h1 style="color: #8b5cf6; margin: 0; font-size: 24px;">Welcome to Sugan Resume Analyzer!</h1>
        <p style="color: #38bdf8; margin: 5px 0 0 0; font-size: 14px;">Your AI-Powered Career Assistant</p>
      </div>
      
      <div style="padding: 20px 0; line-height: 1.6;">
        <p style="font-size: 16px; margin-top: 0;">Hi <strong>${name}</strong>,</p>
        <p>Thank you for registering at Sugan Resume Analyzer. We are excited to help you optimize your professional resume and accelerate your career path!</p>
        
        <p style="margin: 25px 0;">
          <a href="http://localhost:5173/analyzer" style="background: linear-gradient(135deg, #7c3aed 0%, #0284c7 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Analyze Your Resume</a>
        </p>

        <p><strong>With Sugan Resume Analyzer, you can:</strong></p>
        <ul style="padding-left: 20px;">
          <li style="margin-bottom: 8px;">Check your ATS optimization score.</li>
          <li style="margin-bottom: 8px;">Map technical skill gaps against developer roles.</li>
          <li style="margin-bottom: 8px;">Identify keywords missing from your job history.</li>
          <li style="margin-bottom: 8px;">Export executive PDF assessment audits.</li>
        </ul>
      </div>

      <div style="border-top: 1px solid #1e293b; padding-top: 20px; font-size: 12px; color: #64748b; text-align: center;">
        <p style="margin: 0;">Confidential &bull; Sugan Resume Analyzer SaaS Team</p>
        <p style="margin: 5px 0 0 0;">Powered by Brevo Transactional Mailer</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to Sugan Resume Analyzer - AI Resume Analyzer',
    html
  });
};

/**
   * Login Alert Notification Email
   */
const sendLoginNotificationEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0b0f19; color: #f1f5f9; border-radius: 12px; border: 1px solid #1e293b;">
      <div style="text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px;">
        <h1 style="color: #8b5cf6; margin: 0; font-size: 20px;">Security Alert: Successful Login</h1>
      </div>
      
      <div style="padding: 20px 0; line-height: 1.6;">
        <p style="font-size: 16px; margin-top: 0;">Hello <strong>${name}</strong>,</p>
        <p>This is a quick security notification that a successful login was recorded for your account on <strong>${new Date().toLocaleString()}</strong>.</p>
        
        <div style="background-color: rgba(30, 41, 59, 0.4); border: 1px solid #334155; border-radius: 8px; padding: 15px; margin: 20px 0; font-size: 13px; color: #cbd5e1;">
          <strong>Security Tip:</strong> If you did not log in at this time, please change your security credentials immediately under your Profile settings.
        </div>
      </div>

      <div style="border-top: 1px solid #1e293b; padding-top: 20px; font-size: 12px; color: #64748b; text-align: center;">
        <p style="margin: 0;">Sugan Resume Analyzer Account Safety Team</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Security Alert: Login Notification - Sugan Resume Analyzer',
    html
  });
};

/**
   * Password Reset instructions link
   */
const sendPasswordResetEmail = async (email, name, resetLink) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0b0f19; color: #f1f5f9; border-radius: 12px; border: 1px solid #1e293b;">
      <div style="text-align: center; border-bottom: 1px solid #1e293b; padding-bottom: 20px;">
        <h1 style="color: #8b5cf6; margin: 0; font-size: 22px;">Reset Your Password</h1>
      </div>
      
      <div style="padding: 20px 0; line-height: 1.6;">
        <p style="font-size: 16px; margin-top: 0;">Hi <strong>${name}</strong>,</p>
        <p>We received a request to reset the password for your Sugan Resume Analyzer account. To reset your password, click the button below:</p>
        
        <p style="margin: 25px 0;">
          <a href="${resetLink}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </p>

        <p style="font-size: 13px; color: #64748b;">
          This link will expire in 1 hour. If you did not make this request, you can safely ignore this email.
        </p>
        
        <p style="font-size: 11px; color: #475569; word-break: break-all;">
          If the button doesn't work, copy and paste this link in your browser:<br />
          ${resetLink}
        </p>
      </div>

      <div style="border-top: 1px solid #1e293b; padding-top: 20px; font-size: 12px; color: #64748b; text-align: center;">
        <p style="margin: 0;">Sugan Resume Analyzer Security Team</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Password Reset Request - Sugan Resume Analyzer',
    html
  });
};

module.exports = {
  sendWelcomeEmail,
  sendLoginNotificationEmail,
  sendPasswordResetEmail
};
