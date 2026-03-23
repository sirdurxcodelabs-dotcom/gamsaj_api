/**
 * Professional Email Templates for GAMSAJ International Limited
 * All templates include company branding and responsive design
 */

// Base template with logo and company branding
const baseTemplate = (content, options = {}) => {
  const {
    title = 'GAMSAJ International Limited',
    preheader = '',
    showLogo = true,
    primaryColor = '#1a73e8',
    secondaryColor = '#0d47a1',
  } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f5f7fa;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .email-wrapper {
      width: 100%;
      background-color: #f5f7fa;
      padding: 20px 0;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
    }
    .email-header {
      background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
      padding: 50px 30px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .email-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      animation: pulse 15s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }
    .logo-container {
      margin-bottom: 25px;
      background: rgba(255, 255, 255, 0.95);
      padding: 20px;
      border-radius: 12px;
      display: inline-block;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
      position: relative;
      z-index: 1;
    }
    .logo {
      max-width: 200px;
      height: auto;
      display: block;
    }
    .header-title {
      color: #ffffff;
      font-size: 32px;
      font-weight: 700;
      margin: 0;
      text-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
      letter-spacing: -0.5px;
      position: relative;
      z-index: 1;
    }
    .header-subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      font-weight: 400;
      margin: 10px 0 0 0;
      position: relative;
      z-index: 1;
    }
    .email-body {
      padding: 40px 30px;
      background-color: #ffffff;
    }
    .email-body p {
      margin: 0 0 16px 0;
      color: #4a5568;
      font-size: 16px;
      line-height: 1.7;
    }
    .email-body h2 {
      color: #2d3748;
      font-size: 22px;
      font-weight: 600;
      margin: 0 0 20px 0;
    }
    .email-body h3 {
      color: #2d3748;
      font-size: 18px;
      font-weight: 600;
      margin: 24px 0 12px 0;
    }
    .button {
      display: inline-block;
      padding: 16px 40px;
      background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 600;
      font-size: 16px;
      margin: 24px 0;
      box-shadow: 0 6px 20px rgba(26, 115, 232, 0.4);
      transition: all 0.3s ease;
      border: none;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      font-size: 14px;
    }
    .button:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(26, 115, 232, 0.5);
    }
    .info-box {
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      border-left: 5px solid ${primaryColor};
      padding: 24px;
      margin: 24px 0;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      position: relative;
      overflow: hidden;
    }
    .info-box::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 100px;
      height: 100px;
      background: radial-gradient(circle, rgba(26, 115, 232, 0.05) 0%, transparent 70%);
    }
    .info-box p {
      margin: 0;
      color: #2d3748;
      position: relative;
      z-index: 1;
    }
    .divider {
      height: 1px;
      background: linear-gradient(to right, transparent, #e2e8f0, transparent);
      margin: 30px 0;
    }
    .email-footer {
      background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
      color: #cbd5e0;
      padding: 40px 30px;
      text-align: center;
      position: relative;
    }
    .email-footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 50%, ${primaryColor} 100%);
    }
    .footer-logo-container {
      background: rgba(255, 255, 255, 0.05);
      padding: 15px;
      border-radius: 10px;
      display: inline-block;
      margin-bottom: 25px;
    }
    .footer-logo {
      max-width: 140px;
      height: auto;
      opacity: 0.95;
      filter: brightness(1.1);
    }
    .footer-content {
      font-size: 14px;
      line-height: 1.8;
    }
    .footer-content p {
      margin: 8px 0;
      color: #cbd5e0;
    }
    .footer-content strong {
      color: #ffffff;
      font-weight: 600;
    }
    .social-links {
      margin: 25px 0;
      padding: 20px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .social-links a {
      display: inline-block;
      margin: 0 12px;
      color: #cbd5e0;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      padding: 8px 16px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.05);
    }
    .social-links a:hover {
      color: #ffffff;
      background: rgba(26, 115, 232, 0.3);
      transform: translateY(-2px);
    }
    .copyright {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #4a5568;
      font-size: 12px;
      color: #a0aec0;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        border-radius: 0;
      }
      .email-header {
        padding: 30px 20px;
      }
      .header-title {
        font-size: 24px;
      }
      .email-body {
        padding: 30px 20px;
      }
      .button {
        display: block;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;font-size:1px;color:#fefefe;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>` : ''}
  
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        ${showLogo ? `
        <div class="logo-container">
          <img src="https://res.cloudinary.com/sirdurx/image/upload/v1737547890/GamSaj_Logo_iqvqxe.png" alt="GAMSAJ International Limited" class="logo">
        </div>
        ` : ''}
        <h1 class="header-title">${title}</h1>
        ${showLogo ? '<p class="header-subtitle">Building Excellence, Delivering Quality</p>' : ''}
      </div>
      
      <div class="email-body">
        ${content}
      </div>
      
      <div class="email-footer">
        <div class="footer-logo-container">
          <img src="https://res.cloudinary.com/sirdurx/image/upload/v1737547890/GamSaj_Logo_iqvqxe.png" alt="GAMSAJ International Limited" class="footer-logo">
        </div>
        <div class="footer-content">
          <p><strong>GAMSAJ International Limited</strong></p>
          <p style="font-size: 15px; margin: 8px 0;">Building Excellence, Delivering Quality</p>
          <p style="margin-top: 15px;">RC: 965221 | Abuja, FCT, Nigeria</p>
          <p>📧 <a href="mailto:info@gamsaj.com" style="color: #cbd5e0; text-decoration: none;">info@gamsaj.com</a> | 📞 +234 800 000 0000</p>
          <p>🌐 <a href="https://www.gamsaj.com" style="color: #cbd5e0; text-decoration: none;">www.gamsaj.com</a></p>
        </div>
        <div class="social-links">
          <a href="#" style="color: #cbd5e0;">LinkedIn</a>
          <a href="#" style="color: #cbd5e0;">Twitter</a>
          <a href="#" style="color: #cbd5e0;">Facebook</a>
        </div>
        <div class="copyright">
          <p style="font-size: 13px; margin: 5px 0;">© ${new Date().getFullYear()} GAMSAJ International Limited. All rights reserved.</p>
          <p style="font-size: 12px; margin: 5px 0;">This email was sent to you by GAMSAJ International Limited.</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;
};


// Contact Form Reply Template
const contactReplyTemplate = (data) => {
  const { name, message, replyMessage, adminName } = data;

  const content = `
    <p>Dear <strong>${name}</strong>,</p>
    
    <p>Thank you for reaching out to GAMSAJ International Limited. We have received your inquiry and are pleased to respond.</p>
    
    <div class="info-box">
      <p><strong>Your Message:</strong></p>
      <p style="margin-top: 10px; font-style: italic;">"${message}"</p>
    </div>
    
    <h3>Our Response:</h3>
    <p>${replyMessage}</p>
    
    <div class="divider"></div>
    
    <p>If you have any additional questions or need further assistance, please don't hesitate to contact us. We're here to help!</p>
    
    <p>Best regards,<br>
    <strong>${adminName || 'GAMSAJ Team'}</strong><br>
    GAMSAJ International Limited</p>
  `;

  return baseTemplate(content, {
    title: 'Response to Your Inquiry',
    preheader: 'Thank you for contacting GAMSAJ International Limited',
  });
};

// Welcome Email Template
const welcomeTemplate = (data) => {
  const { name, email } = data;

  const content = `
    <p>Dear <strong>${name}</strong>,</p>
    
    <p>Welcome to <strong>GAMSAJ International Limited</strong>! We're thrilled to have you join our community.</p>
    
    <p>At GAMSAJ, we specialize in:</p>
    <ul style="margin: 20px 0; padding-left: 20px; color: #4a5568;">
      <li style="margin: 8px 0;">🏗️ <strong>Construction & Engineering</strong> - Building excellence across Nigeria</li>
      <li style="margin: 8px 0;">⚖️ <strong>Legal Services</strong> - Expert legal counsel and representation</li>
      <li style="margin: 8px 0;">📊 <strong>Project Management</strong> - Delivering projects on time and within budget</li>
      <li style="margin: 8px 0;">🔧 <strong>Maintenance Services</strong> - Keeping your assets in top condition</li>
    </ul>
    
    <div class="info-box">
      <p><strong>Your Account Details:</strong></p>
      <p style="margin-top: 10px;">Email: ${email}</p>
    </div>
    
    <p style="text-align: center;">
      <a href="https://gamsaj.com" class="button">Explore Our Services</a>
    </p>
    
    <p>If you have any questions or need assistance, our team is always ready to help.</p>
    
    <p>Best regards,<br>
    <strong>The GAMSAJ Team</strong></p>
  `;

  return baseTemplate(content, {
    title: 'Welcome to GAMSAJ!',
    preheader: 'Thank you for joining GAMSAJ International Limited',
  });
};

// Project Update Template
const projectUpdateTemplate = (data) => {
  const { clientName, projectName, updateMessage, progress, nextSteps } = data;

  const content = `
    <p>Dear <strong>${clientName}</strong>,</p>
    
    <p>We're writing to provide you with an update on your project: <strong>${projectName}</strong>.</p>
    
    <h3>Project Progress</h3>
    <div class="info-box">
      <p><strong>Current Status:</strong> ${progress}% Complete</p>
      <div style="background: #e2e8f0; height: 20px; border-radius: 10px; margin-top: 10px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%); height: 100%; width: ${progress}%; border-radius: 10px;"></div>
      </div>
    </div>
    
    <h3>Update Details</h3>
    <p>${updateMessage}</p>
    
    ${nextSteps ? `
    <h3>Next Steps</h3>
    <p>${nextSteps}</p>
    ` : ''}
    
    <div class="divider"></div>
    
    <p>We remain committed to delivering excellence and keeping you informed every step of the way.</p>
    
    <p>Should you have any questions or concerns, please don't hesitate to reach out.</p>
    
    <p>Best regards,<br>
    <strong>GAMSAJ Project Team</strong></p>
  `;

  return baseTemplate(content, {
    title: 'Project Update',
    preheader: `Update on ${projectName}`,
  });
};

// Meeting Invitation Template
const meetingInvitationTemplate = (data) => {
  const { recipientName, meetingTitle, date, time, location, agenda, meetingLink } = data;

  const content = `
    <p>Dear <strong>${recipientName}</strong>,</p>
    
    <p>You are cordially invited to attend the following meeting:</p>
    
    <h2 style="text-align: center; color: #1a73e8; margin: 30px 0;">${meetingTitle}</h2>
    
    <div class="info-box">
      <p><strong>📅 Date:</strong> ${date}</p>
      <p><strong>🕐 Time:</strong> ${time}</p>
      <p><strong>📍 Location:</strong> ${location}</p>
    </div>
    
    ${agenda ? `
    <h3>Agenda</h3>
    <p>${agenda}</p>
    ` : ''}
    
    ${meetingLink ? `
    <p style="text-align: center;">
      <a href="${meetingLink}" class="button">Join Virtual Meeting</a>
    </p>
    ` : ''}
    
    <p>Please confirm your attendance at your earliest convenience.</p>
    
    <p>We look forward to your participation.</p>
    
    <p>Best regards,<br>
    <strong>GAMSAJ Team</strong></p>
  `;

  return baseTemplate(content, {
    title: 'Meeting Invitation',
    preheader: `You're invited: ${meetingTitle}`,
  });
};


// Quote/Proposal Template
const quoteTemplate = (data) => {
  const { clientName, projectName, quoteNumber, items, total, validUntil, terms } = data;

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.description}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right;">₦${item.unitPrice.toLocaleString()}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 600;">₦${item.total.toLocaleString()}</td>
    </tr>
  `).join('');

  const content = `
    <p>Dear <strong>${clientName}</strong>,</p>
    
    <p>Thank you for your interest in GAMSAJ International Limited. We are pleased to provide you with the following quotation for <strong>${projectName}</strong>.</p>
    
    <div class="info-box">
      <p><strong>Quote Number:</strong> ${quoteNumber}</p>
      <p><strong>Valid Until:</strong> ${validUntil}</p>
    </div>
    
    <h3>Quotation Details</h3>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #ffffff;">
      <thead>
        <tr style="background: #f7fafc;">
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #1a73e8;">Description</th>
          <th style="padding: 12px; text-align: center; border-bottom: 2px solid #1a73e8;">Qty</th>
          <th style="padding: 12px; text-align: right; border-bottom: 2px solid #1a73e8;">Unit Price</th>
          <th style="padding: 12px; text-align: right; border-bottom: 2px solid #1a73e8;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr style="background: #f7fafc;">
          <td colspan="3" style="padding: 16px; text-align: right; font-weight: 600; font-size: 18px;">Grand Total:</td>
          <td style="padding: 16px; text-align: right; font-weight: 700; font-size: 18px; color: #1a73e8;">₦${total.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>
    
    ${terms ? `
    <h3>Terms & Conditions</h3>
    <p style="font-size: 14px; color: #4a5568;">${terms}</p>
    ` : ''}
    
    <div class="divider"></div>
    
    <p>We look forward to the opportunity to work with you on this project. Should you have any questions or require clarification, please don't hesitate to contact us.</p>
    
    <p>Best regards,<br>
    <strong>GAMSAJ Sales Team</strong></p>
  `;

  return baseTemplate(content, {
    title: 'Quotation',
    preheader: `Quote #${quoteNumber} for ${projectName}`,
  });
};

// Newsletter Template
const newsletterTemplate = (data) => {
  const { headline, articles, ctaText, ctaLink } = data;

  const articlesHtml = articles.map(article => `
    <div style="margin: 30px 0; padding: 20px; background: #f7fafc; border-radius: 8px;">
      ${article.image ? `<img src="${article.image}" alt="${article.title}" style="width: 100%; border-radius: 6px; margin-bottom: 15px;">` : ''}
      <h3 style="color: #2d3748; margin: 0 0 10px 0;">${article.title}</h3>
      <p style="color: #4a5568; margin: 0 0 15px 0;">${article.excerpt}</p>
      ${article.link ? `<a href="${article.link}" style="color: #1a73e8; text-decoration: none; font-weight: 600;">Read More →</a>` : ''}
    </div>
  `).join('');

  const content = `
    <h2 style="text-align: center; color: #1a73e8; margin: 0 0 30px 0;">${headline}</h2>
    
    ${articlesHtml}
    
    ${ctaText && ctaLink ? `
    <p style="text-align: center; margin: 40px 0;">
      <a href="${ctaLink}" class="button">${ctaText}</a>
    </p>
    ` : ''}
    
    <div class="divider"></div>
    
    <p style="text-align: center; color: #718096; font-size: 14px;">
      You're receiving this email because you subscribed to GAMSAJ International Limited updates.
    </p>
  `;

  return baseTemplate(content, {
    title: 'GAMSAJ Newsletter',
    preheader: headline,
  });
};

// Password Reset Template
const passwordResetTemplate = (data) => {
  const { name, resetLink, expiryTime } = data;

  const content = `
    <p>Dear <strong>${name}</strong>,</p>
    
    <p>We received a request to reset your password for your GAMSAJ account.</p>
    
    <p style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" class="button">Reset Your Password</a>
    </p>
    
    <div class="info-box">
      <p><strong>⚠️ Important:</strong></p>
      <p>This link will expire in <strong>${expiryTime}</strong>.</p>
      <p>If you didn't request this password reset, please ignore this email or contact us if you have concerns.</p>
    </div>
    
    <p>For security reasons, please do not share this link with anyone.</p>
    
    <p>Best regards,<br>
    <strong>GAMSAJ Security Team</strong></p>
  `;

  return baseTemplate(content, {
    title: 'Password Reset Request',
    preheader: 'Reset your GAMSAJ account password',
  });
};

// Export all templates
module.exports = {
  baseTemplate,
  contactReplyTemplate,
  welcomeTemplate,
  projectUpdateTemplate,
  meetingInvitationTemplate,
  quoteTemplate,
  newsletterTemplate,
  passwordResetTemplate,
};
