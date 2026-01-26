import nodemailer from "nodemailer";

// Create transporter - configure based on your email provider
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generate 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Get OTP expiry time (15 minutes from now)
export const getOTPExpiry = (): Date => {
  return new Date(Date.now() + 15 * 60 * 1000);
};

// Email templates
const emailTemplates = {
  verificationOTP: (name: string, otp: string) => ({
    subject: "UMUTI - Verify Your Email Address",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .otp-box { background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
          .otp-code { font-size: 36px; font-weight: bold; color: #16a34a; letter-spacing: 8px; }
          .footer { background: #f9fafb; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 14px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin-top: 20px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>UMUTI</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Rwanda Medicine Finder</p>
          </div>
          <div class="content">
            <h2 style="color: #1f2937; margin-top: 0;">Hello ${name}!</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Thank you for registering with UMUTI. To complete your registration, please use the verification code below:
            </p>
            <div class="otp-box">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Your Verification Code</p>
              <div class="otp-code">${otp}</div>
            </div>
            <p style="color: #4b5563; line-height: 1.6;">
              Enter this code in the verification page to activate your account.
            </p>
            <div class="warning">
              <strong>Important:</strong> This code expires in 15 minutes. If you didn't request this, please ignore this email.
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} UMUTI. All rights reserved.</p>
            <p>Kigali, Rwanda</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  applicationApproved: (name: string, pharmacyName: string) => ({
    subject: "UMUTI - Your Pharmacy Application Has Been Approved!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .success-box { background: #f0fdf4; border: 2px solid #22c55e; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
          .checkmark { font-size: 48px; }
          .footer { background: #f9fafb; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 14px; }
          .btn { display: inline-block; background: #22c55e; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>UMUTI</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Rwanda Medicine Finder</p>
          </div>
          <div class="content">
            <h2 style="color: #1f2937; margin-top: 0;">Congratulations ${name}!</h2>
            <div class="success-box">
              <div class="checkmark">&#10004;</div>
              <h3 style="color: #16a34a; margin: 10px 0;">Application Approved</h3>
              <p style="color: #4b5563; margin: 0;">${pharmacyName} is now verified!</p>
            </div>
            <p style="color: #4b5563; line-height: 1.6;">
              Great news! Your pharmacy application has been reviewed and approved by our admin team. You can now:
            </p>
            <ul style="color: #4b5563; line-height: 1.8;">
              <li>Log in to your pharmacy dashboard</li>
              <li>Add your medicine inventory</li>
              <li>Manage your pharmacy information</li>
              <li>Start receiving customers through UMUTI</li>
            </ul>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/login" class="btn">Go to Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} UMUTI. All rights reserved.</p>
            <p>Kigali, Rwanda</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  applicationRejected: (name: string, pharmacyName: string, reason: string) => ({
    subject: "UMUTI - Update on Your Pharmacy Application",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .rejection-box { background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 20px; margin: 30px 0; }
          .reason-box { background: #f9fafb; border-left: 4px solid #ef4444; padding: 15px; margin-top: 15px; }
          .footer { background: #f9fafb; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 14px; }
          .btn { display: inline-block; background: #22c55e; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>UMUTI</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Rwanda Medicine Finder</p>
          </div>
          <div class="content">
            <h2 style="color: #1f2937; margin-top: 0;">Hello ${name},</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              We have reviewed your application for <strong>${pharmacyName}</strong> and unfortunately, we are unable to approve it at this time.
            </p>
            <div class="rejection-box">
              <h3 style="color: #dc2626; margin-top: 0;">Application Status: Not Approved</h3>
              <div class="reason-box">
                <p style="margin: 0; color: #4b5563;"><strong>Reason:</strong></p>
                <p style="margin: 10px 0 0 0; color: #6b7280;">${reason}</p>
              </div>
            </div>
            <p style="color: #4b5563; line-height: 1.6;">
              Don't worry! You can submit a new application after addressing the issues mentioned above. If you believe this was a mistake or need clarification, please contact our support team.
            </p>
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/pharmacy/register" class="btn">Submit New Application</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} UMUTI. All rights reserved.</p>
            <p>Kigali, Rwanda</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  welcomePharmacy: (name: string, pharmacyName: string) => ({
    subject: "UMUTI - Welcome to UMUTI!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .footer { background: #f9fafb; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>UMUTI</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Rwanda Medicine Finder</p>
          </div>
          <div class="content">
            <h2 style="color: #1f2937; margin-top: 0;">Welcome ${name}!</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              Thank you for registering <strong>${pharmacyName}</strong> with UMUTI. Your application has been submitted and is pending review by our admin team.
            </p>
            <p style="color: #4b5563; line-height: 1.6;">
              We will notify you via email once your application has been reviewed. This usually takes 1-2 business days.
            </p>
            <h3 style="color: #1f2937;">What happens next?</h3>
            <ol style="color: #4b5563; line-height: 1.8;">
              <li>Our team reviews your application and documents</li>
              <li>You'll receive an email with the decision</li>
              <li>Once approved, you can log in and start managing your pharmacy</li>
            </ol>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} UMUTI. All rights reserved.</p>
            <p>Kigali, Rwanda</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

// Send email function
export const sendEmail = async (
  to: string,
  template: keyof typeof emailTemplates,
  ...args: Parameters<(typeof emailTemplates)[typeof template]>
): Promise<boolean> => {
  try {
    // @ts-ignore - dynamic template call
    const { subject, html } = emailTemplates[template](...args);

    const info = await transporter.sendMail({
      from: `"UMUTI" <${process.env.SMTP_USER || "noreply@umuti.com"}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
};

// Verify SMTP connection
export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    console.log("SMTP connection verified");
    return true;
  } catch (error) {
    console.error("SMTP connection failed:", error);
    return false;
  }
};
