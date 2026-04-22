const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,     // waseemamber33@gmail.com
      pass: process.env.EMAIL_PASS      // App password
    }
  });
};

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  const { fullName, email, phone, company, industry, service, width, height, quantity, paperType, finishing, deadline, message } = req.body;

  // Validation
  if (!fullName || !email || !phone || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'Please fill all required fields' 
    });
  }

  const transporter = createTransporter();

  try {
    // 1. Email to Admin (Company
    await transporter.sendMail({
      from: `"Fast Printing Website" <${process.env.EMAIL_USER}>`,
      to: 'aestheticaura822@gmail.com',  // Company email receives
      subject: `📋 New Project Inquiry from ${fullName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><style>body{font-family:Arial;padding:20px;} h2{color:#dc2626;}</style></head>
        <body>
          <h2>📋 New Project Inquiry</h2>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' })}</p>
          <h3>👤 Customer Information</h3>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Company:</strong> ${company || 'Not provided'}</p>
          <h3>📦 Project Details</h3>
          <p><strong>Industry:</strong> ${industry || 'Not specified'}</p>
          <p><strong>Service:</strong> ${service || 'Not specified'}</p>
          <p><strong>Dimensions:</strong> ${width || '0'} x ${height || '0'} inches</p>
          <p><strong>Quantity:</strong> ${quantity || 'Not provided'}</p>
          <p><strong>Paper Type:</strong> ${paperType || 'Not provided'}</p>
          <p><strong>Finishing:</strong> ${finishing || 'Not provided'}</p>
          <p><strong>Deadline:</strong> ${deadline || 'Not specified'}</p>
          <h3>💬 Message</h3>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p><strong>📞 Call:</strong> ${phone}</p>
          <p><strong>📧 Reply to:</strong> ${email}</p>
        </body>
        </html>
      `
    });

    // 2. Auto-reply to User (Thank you email)
    // Auto-reply to User
await transporter.sendMail({
  from: `"Fast Printing & Packaging" <waseemamber33@gmail.com>`,
  to: email,
  replyTo: 'aestheticaura822@gmail.com',  // ⭐ Customer reply to company email
  subject: 'Thank you for contacting Fast Printing & Packaging',
  html: `
    <div style="text-align:center; padding:20px; background:#dc2626; color:white;">
      <h2>Fast Printing & Packaging</h2>
    </div>
    <div style="padding:20px;">
      <p>Dear <strong>${fullName}</strong>,</p>
      <p>Thank you for contacting us. We have received your inquiry.</p>
      
      <p><strong>📧 For any questions, please reply to:</strong> xfastgroup001@gmail.com</p>
      <p><strong>📞 Or call us at:</strong> 0325 2467463</p>
      
      <p>Our team will respond to you within 24 hours from <strong>xfastgroup001@gmail.com</strong></p>
      
      <p>Best regards,<br>
      <strong>Fast Printing & Packaging Team</strong></p>
    </div>
  `
});
    console.log(`✅ Email sent to: xfastgroup001@gmail.com and auto-reply to: ${email}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Your inquiry has been sent successfully! We will contact you within 24 hours.'
    });

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message. Please try again or call us directly.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Export for Vercel
module.exports = app;