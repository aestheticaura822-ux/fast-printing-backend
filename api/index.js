const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Contact endpoint
app.post('/api/contact', async (req, res) => {
  const { fullName, email, phone, company, industry, service, width, height, quantity, paperType, finishing, deadline, message } = req.body;

  if (!fullName || !email || !phone || !message) {
    return res.status(400).json({ success: false, message: 'Please fill all required fields' });
  }

  const transporter = createTransporter();

  try {
    // Email to Admin (Company)
    await transporter.sendMail({
      from: `"Fast Printing Website" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || 'xfastgroup001@gmail.com',
      subject: `📋 New Project Inquiry from ${fullName}`,
      html: `
        <h2>📋 New Project Inquiry</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Company:</strong> ${company || 'Not provided'}</p>
        <p><strong>Industry:</strong> ${industry || 'Not specified'}</p>
        <p><strong>Service:</strong> ${service || 'Not specified'}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    });

    // Auto-reply to Customer
    await transporter.sendMail({
      from: `"Fast Printing & Packaging" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank you for contacting Fast Printing & Packaging',
      html: `
        <h2>Thank You for Your Inquiry! 🎉</h2>
        <p>Dear ${fullName},</p>
        <p>We have received your inquiry and will contact you within 24 hours.</p>
        <p>Best regards,<br>Fast Printing & Packaging Team</p>
      `
    });

    res.json({ success: true, message: 'Inquiry sent successfully!' });

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = app;