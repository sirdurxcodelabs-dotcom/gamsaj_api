# Email Configuration Guide

The backend is configured to work **without email** by default. Registration will succeed even if email sending fails.

## Current Behavior

- ✅ User registration works without email
- ✅ Login works normally
- ⚠️ Email verification is optional
- ⚠️ Password reset requires email to be configured

## Option 1: Use Gmail (Recommended for Testing)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. Update `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com
```

## Option 2: Use Mailtrap (Recommended for Development)

1. Sign up at https://mailtrap.io (free)
2. Get your SMTP credentials
3. Update `.env`:
```env
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-username
EMAIL_PASSWORD=your-mailtrap-password
EMAIL_FROM=noreply@yourdomain.com
```

## Option 3: Use SendGrid

1. Sign up at https://sendgrid.com
2. Create an API key
3. Update `.env`:
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=verified-sender@yourdomain.com
```

## Option 4: Disable Email Completely

The system already handles email failures gracefully. No additional configuration needed!

## Testing Email

After configuring, restart the server and try registering a new user. Check the terminal for:
- ✅ "Verification email sent successfully" - Email is working
- ⚠️ "Email sending failed, but user was created" - Email failed but registration succeeded

## Troubleshooting

### Error: connect ETIMEDOUT
- Your firewall or network is blocking SMTP
- Try using Mailtrap instead of Gmail
- Or continue without email (registration still works)

### Error: Invalid login
- Check your email credentials in `.env`
- For Gmail, make sure you're using an App Password, not your regular password

### Error: Authentication failed
- Enable "Less secure app access" for Gmail (not recommended)
- Or use App Passwords (recommended)
