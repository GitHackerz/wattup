import nodemailer from 'nodemailer';
import { config } from '../config';
import { logger } from '../utils/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

/**
 * Email service for sending notifications
 */
export class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter;

  private constructor() {
    // If email credentials are not provided, fall back to a JSON transporter for development
    if (!config.email.user || !config.email.password) {
      logger.warn('Email credentials not provided; falling back to JSON transport for development (emails will be logged).');
      this.transporter = nodemailer.createTransport({ jsonTransport: true } as any);
    } else {
      this.transporter = nodemailer.createTransport({
        service: config.email.service,
        auth: {
          user: config.email.user,
          pass: config.email.password,
        },
      });
    }
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Send email
   */
  public async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: config.email.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${options.to}:`, info.messageId);
      return true;
    } catch (error) {
      // Provide actionable log when using Gmail and auth fails
      if ((error as any)?.code === 'EAUTH') {
        logger.error('Email authentication failed (EAUTH). If you are using Gmail, ensure you are using an App Password (required when 2FA is enabled) or enable access for less secure apps. See: https://support.google.com/mail/?p=BadCredentials');
      }
      logger.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send welcome email
   */
  public async sendWelcomeEmail(to: string, firstName: string): Promise<boolean> {
    const subject = 'Welcome to WattUP - Electricity Monitoring System';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to WattUP!</h1>
        <p>Dear ${firstName},</p>
        <p>Welcome to WattUP, your comprehensive electricity monitoring system. We're excited to have you on board!</p>
        <p>With WattUP, you can:</p>
        <ul>
          <li>Monitor real-time energy consumption</li>
          <li>Detect anomalies and receive alerts</li>
          <li>Analyze energy usage patterns</li>
          <li>Generate detailed reports</li>
        </ul>
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The WattUP Team</p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send password reset email
   */
  public async sendPasswordResetEmail(to: string, firstName: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    const subject = 'Password Reset Request - WattUP';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Password Reset Request</h1>
        <p>Dear ${firstName},</p>
        <p>You recently requested to reset your password for your WattUP account. Click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </div>
        <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
        <p><strong>This password reset link will expire in 24 hours.</strong></p>
        <p>Best regards,<br>The WattUP Team</p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send anomaly alert email
   */
  public async sendAnomalyAlert(
    to: string,
    lineName: string,
    consumption: number,
    threshold: number,
    severity: string
  ): Promise<boolean> {
    const subject = `🚨 Energy Anomaly Detected - ${lineName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #dc2626;">⚠️ Anomaly Detected</h1>
        <p>An energy consumption anomaly has been detected in your system:</p>
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 5px; padding: 16px; margin: 20px 0;">
          <p><strong>Line:</strong> ${lineName}</p>
          <p><strong>Consumption:</strong> ${consumption} kW</p>
          <p><strong>Threshold:</strong> ${threshold} kW</p>
          <p><strong>Severity:</strong> <span style="color: ${this.getSeverityColor(severity)}; font-weight: bold;">${severity.toUpperCase()}</span></p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>Please review this anomaly and take appropriate action if necessary.</p>
        <p>Best regards,<br>WattUP Monitoring System</p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Send system notification email
   */
  public async sendSystemNotification(
    to: string,
    title: string,
    message: string
  ): Promise<boolean> {
    const subject = `WattUP System Notification - ${title}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">System Notification</h1>
        <h2>${title}</h2>
        <p>${message}</p>
        <p>Best regards,<br>WattUP System</p>
      </div>
    `;

    return this.sendEmail({ to, subject, html });
  }

  /**
   * Get severity color for email styling
   */
  private getSeverityColor(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#ca8a04';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  }

  /**
   * Verify email service configuration
   */
  public async verifyConfiguration(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('Email service configuration verified successfully');
      return true;
    } catch (error) {
      logger.error('Email service configuration error:', error);
      return false;
    }
  }
}
