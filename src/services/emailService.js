const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendVerificationEmail(to, token) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const mailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@fixxit.com',
    to,
    subject: 'Verify your Fixxit account',
    html: `<p>Click the link below to verify your email address:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`
  };
  await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail }; 