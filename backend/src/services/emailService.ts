import nodemailer from 'nodemailer';
import { env, isDevelopment } from '../config/env.js';

// Create transporter — uses SMTP env vars in production, Ethereal/console in dev
const createTransporter = () => {
  if (isDevelopment && !process.env.SMTP_HOST) {
    // In dev without SMTP config, log to console only
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const transporter = createTransporter();

export const emailService = {
  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    if (!transporter) {
      // Fallback for dev without SMTP — log only, never return the token
      console.log(`[DEV] Password reset email for ${to}`);
      console.log(`[DEV] Reset URL: ${resetUrl}`);
      return;
    }

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"PollStraw" <noreply@pollstraw.com>`,
      to,
      subject: 'Reset your PollStraw password',
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Password Reset</h2>
          <p>You requested a password reset for your PollStraw account.</p>
          <p>Click the button below to set a new password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
            Reset Password
          </a>
          <p style="margin-top:24px;color:#666;font-size:14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  },
};
