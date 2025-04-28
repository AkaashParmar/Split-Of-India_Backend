// utils/sendEmail.js

const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',  // Use your email service (e.g., Gmail, SendGrid, etc.)
        auth: {
            user: process.env.EMAIL_USER,  // Email address from which the email is sent
            pass: process.env.EMAIL_PASS,  // Password for the email
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Could not send email');
    }
};

module.exports = sendEmail;
