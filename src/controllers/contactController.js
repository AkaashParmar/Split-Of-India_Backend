const nodemailer = require('nodemailer');

const sendContactMail = async (req, res) => {
  const { email, phone, message } = req.body;

  if (!email || !phone || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: 'New Contact Query from Spirit of India',
      html: `
        <h2>New Contact Submission</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ error: 'Failed to send email.' });
  }
};

module.exports = { sendContactMail };
