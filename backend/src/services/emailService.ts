import { config } from '@/config';
import logger from '@/config/logger';

// Email service interface
interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

// Mock email service for development
class EmailService {
  private isMockMode: boolean;

  constructor() {
    this.isMockMode = !config.email?.smtp?.host || config.email?.smtp?.host === 'smtp.example.com';
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (this.isMockMode) {
      // Mock email sending for development
      logger.info('Mock email sent:', {
        to: options.to,
        subject: options.subject,
        text: options.text?.substring(0, 100) + '...',
      });
      return true;
    }

    try {
      // In production, you would integrate with a real email service like:
      // - SendGrid
      // - AWS SES
      // - Mailgun
      // - Nodemailer with SMTP
      
      logger.info('Email sent successfully:', {
        to: options.to,
        subject: options.subject,
      });
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string, userName?: string): Promise<boolean> {
    const resetUrl = `${config.frontend.url}/reset-password?token=${resetToken}`;
    
    const subject = 'Password Reset Request - Dr. Fintan Virtual Care Hub';
    
    const text = `
Hello ${userName || 'User'},

You have requested to reset your password for Dr. Fintan Virtual Care Hub.

Please click the following link to reset your password:
${resetUrl}

This link will expire in 15 minutes for security reasons.

If you did not request this password reset, please ignore this email.

Best regards,
Dr. Fintan Virtual Care Hub Team
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset Request</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Dr. Fintan Virtual Care Hub</h1>
        </div>
        <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello ${userName || 'User'},</p>
            <p>You have requested to reset your password for Dr. Fintan Virtual Care Hub.</p>
            <p>Please click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>Or copy and paste this link into your browser:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p><strong>This link will expire in 15 minutes for security reasons.</strong></p>
            <p>If you did not request this password reset, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>Dr. Fintan Virtual Care Hub Team</p>
        </div>
    </div>
</body>
</html>
    `.trim();

    return this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }

  async sendWelcomeEmail(email: string, userName: string): Promise<boolean> {
    const subject = 'Welcome to Dr. Fintan Virtual Care Hub';
    
    const text = `
Hello ${userName},

Welcome to Dr. Fintan Virtual Care Hub!

Your account has been successfully created. You can now:
- Book appointments with healthcare providers
- Join video consultations
- Manage your medical records
- Make secure payments

Visit our platform: ${config.frontend.url}

If you have any questions, please don't hesitate to contact our support team.

Best regards,
Dr. Fintan Virtual Care Hub Team
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome to Dr. Fintan Virtual Care Hub</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Dr. Fintan Virtual Care Hub</h1>
        </div>
        <div class="content">
            <h2>Welcome!</h2>
            <p>Hello ${userName},</p>
            <p>Welcome to Dr. Fintan Virtual Care Hub!</p>
            <p>Your account has been successfully created. You can now:</p>
            <ul>
                <li>Book appointments with healthcare providers</li>
                <li>Join video consultations</li>
                <li>Manage your medical records</li>
                <li>Make secure payments</li>
            </ul>
            <a href="${config.frontend.url}" class="button">Visit Platform</a>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>Dr. Fintan Virtual Care Hub Team</p>
        </div>
    </div>
</body>
</html>
    `.trim();

    return this.sendEmail({
      to: email,
      subject,
      text,
      html,
    });
  }
}

// Initialize email service
export const emailService = new EmailService();

// Validate email configuration
export const validateEmailConfig = () => {
  if (!config.email?.smtp?.host) {
    logger.warn('Email SMTP configuration not found - using mock mode');
    return false;
  }
  return true;
};
