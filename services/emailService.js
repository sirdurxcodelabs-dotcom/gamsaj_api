const nodemailer = require('nodemailer');
const emailTemplates = require('../templates/emailTemplates');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send email with template
exports.sendEmail = async ({ from, to, subject, text, html, template, templateData, attachments = [] }) => {
  try {
    const transporter = createTransporter();

    // Use template if provided
    let emailHtml = html || text;
    if (template && templateData) {
      emailHtml = emailTemplates[template](templateData);
    }

    const mailOptions = {
      from: from || `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || subject,
      html: emailHtml,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Verify SMTP connection
exports.verifyConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    return { success: true, message: 'SMTP connection verified' };
  } catch (error) {
    console.error('SMTP verification error:', error);
    return { success: false, error: error.message };
  }
};

// Generate HTML email template
exports.generateEmailTemplate = (content, options = {}) => {
  const { title = 'GAMSAJ International Limited', footer = true } = options;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f4f4f4;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          padding: 30px 20px;
          background: #ffffff;
        }
        .content p {
          margin: 0 0 15px 0;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
          border-top: 1px solid #dee2e6;
        }
        .footer p {
          margin: 5px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .divider {
          height: 1px;
          background: #dee2e6;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        ${
          footer
            ? `
        <div class="footer">
          <p><strong>GAMSAJ International Limited</strong></p>
          <p>RC: 965221 | Abuja, FCT, Nigeria</p>
          <p>Email: info@gamsaj.com | Phone: +234 800 000 0000</p>
          <p style="margin-top: 15px; font-size: 12px;">
            © ${new Date().getFullYear()} GAMSAJ International Limited. All rights reserved.
          </p>
        </div>
        `
            : ''
        }
      </div>
    </body>
    </html>
  `;
};
