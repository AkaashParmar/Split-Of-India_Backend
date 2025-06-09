const nodemailer = require('nodemailer');

const sendEmail = async ({ from, to, subject, text, attachments = [], replyTo }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email credentials are not set. Please check your environment variables.');
  }

  if (!from) {
    throw new Error('Sender email (from) is required.');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from,    // now defined from param
    to,
    subject,
    text,
    attachments,
    ...(replyTo && { replyTo }),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent to:', to, 'Response:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Could not send email');
  }
};

module.exports = sendEmail;
