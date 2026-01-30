import { getEmailSettings, getGeneralSettings } from "@/lib/settings";
import nodemailer from "nodemailer";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Send an email using SMTP settings from the database.
 * Returns { success: true } or { success: false, error: string }.
 */
export async function sendEmail(payload: EmailPayload) {
  const email = await getEmailSettings();

  if (!email.smtpEnabled) {
    return { success: false, error: "SMTP is not enabled" };
  }

  if (!email.smtpHost || !email.smtpUser) {
    return { success: false, error: "SMTP is not configured" };
  }

  try {
    const transport = nodemailer.createTransport({
      host: email.smtpHost,
      port: email.smtpPort,
      secure: email.smtpPort === 465,
      auth: {
        user: email.smtpUser,
        pass: email.smtpPassword,
      },
    });

    await transport.sendMail({
      from: `"${email.fromName}" <${email.fromAddr}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown SMTP error";
    return { success: false, error: message };
  }
}

/**
 * Send a verification email to a newly registered user.
 */
export async function sendVerificationEmail(userEmail: string, token: string) {
  const general = await getGeneralSettings();
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-email?token=${token}`;

  return sendEmail({
    to: userEmail,
    subject: `Verify your email - ${general.siteName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Welcome to ${general.siteName}!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">
            Verify Email
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          If you didn't create an account, you can ignore this email.
        </p>
      </div>
    `,
    text: `Verify your email: ${verifyUrl}`,
  });
}

/**
 * Send a password reset email.
 */
export async function sendPasswordResetEmail(userEmail: string, token: string) {
  const general = await getGeneralSettings();
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  return sendEmail({
    to: userEmail,
    subject: `Reset your password - ${general.siteName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>${general.siteName} Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">
            Reset Password
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px;">
          This link expires in 1 hour. If you didn't request a reset, ignore this email.
        </p>
      </div>
    `,
    text: `Reset your password: ${resetUrl}`,
  });
}

/**
 * Send a test email (used by admin "Send Test Email" button).
 */
export async function sendTestEmail(to: string) {
  const general = await getGeneralSettings();

  return sendEmail({
    to,
    subject: `Test Email - ${general.siteName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>SMTP Test Successful</h2>
        <p>This is a test email from <strong>${general.siteName}</strong>.</p>
        <p>If you received this, your email settings are configured correctly.</p>
      </div>
    `,
    text: `SMTP test successful from ${general.siteName}`,
  });
}
