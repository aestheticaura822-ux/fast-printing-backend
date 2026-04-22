const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

console.log('📧 Admin Email (receiving):', process.env.ADMIN_EMAIL);
console.log('📧 Sender Email:', process.env.EMAIL_USER);

// Email transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify email config
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email config error:', error);
  } else {
    console.log('✅ Email server ready');
  }
});

// Contact endpoint
app.post('/api/contact', async (req, res) => {
  const { fullName, email, phone, company, industry, service, width, height, quantity, paperType, finishing, deadline, message } = req.body;

  console.log('📩 Received inquiry from:', fullName);

  if (!fullName || !email || !phone || !message) {
    return res.status(400).json({ success: false, message: 'Please fill all required fields' });
  }

  try {
    // 1. Email to Admin (Aapke personal email par)
    await transporter.sendMail({
      from: `"Fast Printing Website" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,  // aestheticaura822@gmail.com
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

    // 2. Auto-reply to Customer
    await transporter.sendMail({
      from: `"Fast Printing & Packaging" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank you for contacting Fast Printing & Packaging',
      html: `
        <!DOCTYPE html>
        <html>
        <head><style>body{font-family:Arial;padding:20px;} h1{color:#dc2626;}</style></head>
        <body>
          <div style="text-align:center; padding:20px; background:#dc2626; color:white;">
            <h2>Fast Printing & Packaging</h2>
          </div>
          <div style="padding:20px;">
            <h1>Thank You for Your Inquiry! 🎉</h1>
            <p>Dear <strong>${fullName}</strong>,</p>
            <p>Thank you for contacting <strong>Fast Printing & Packaging</strong>. We have received your project inquiry and our team will review it shortly.</p>
            
            <h3>📌 What happens next?</h3>
            <ul>
              <li>✅ Our team will review your requirements within <strong>24 hours</strong></li>
              <li>📞 We may call you on <strong>${phone}</strong> to discuss further details</li>
              <li>📄 A detailed quote will be sent to your email address</li>
            </ul>
            
            <p>For urgent inquiries, please call us at: <strong>0325 2467463</strong></p>
            
            <p>Best regards,<br>
            <strong>Fast Printing & Packaging Team</strong></p>
          </div>
        </body>
        </html>
      `
    });

    console.log(`✅ Email sent to: ${process.env.ADMIN_EMAIL} and auto-reply to: ${email}`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Your inquiry has been sent successfully! We will contact you within 24 hours.'
    });

  } catch (error) {
    console.error('❌ Email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message. Please try again or call us directly.'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Contact endpoint: http://localhost:${PORT}/api/contact`);
  console.log(`📨 Admin emails will go to: ${process.env.ADMIN_EMAIL}`);
});