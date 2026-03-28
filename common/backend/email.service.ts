import nodemailer from "nodemailer";
import path from "path";

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  public async sendMail(to: string, subject: string, text: string) {
    const info = await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      text,
    });

    console.log("Message sent:", info.messageId);
  }

  public async sendOtpMail(to: string, otp: string, expiryMinutes = 5) {
    const subject = "Your OTP for Password Reset";
    const html = `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f8f8f8;">
      <img src="cid:logo" alt="Eye Consulting Solutions" style="width: 120px; margin-bottom: 20px;" />
      <h2 style="color: #333;">Your OTP for Password Reset</h2>
      <p style="font-size: 16px; color: #555;">Your One-Time Password is:</p>
      <h1 style="font-size: 36px; color: #007bff; margin: 10px 0;">${otp}</h1>
      <p style="font-size: 14px; color: #555;">It is valid for <strong>${expiryMinutes} minutes</strong>.</p>
      <hr style="margin: 20px 0;" />
      <p style="font-size: 12px; color: #999;">If you did not request this, please ignore this email.</p>
    </div>
  `;

    const logoPath = path.join(process.cwd(), "public", "logo.png");

    // Send both emails in parallel
    await Promise.all([
      this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject,
        html,
        attachments: [
          {
            filename: "logo.png",
            path: logoPath,
            cid: "logo",
          },
        ],
      }),
      this.notifyAdminForgotPassword(to),
    ]);
  }

  public async notifyAdminForgotPassword(userEmail: string) {
    const subject = "Password Reset Requested";
    const text = `
    A password reset was requested by the following user:
    Email: ${userEmail}
    
    Please verify if needed.
  `;

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.SENDER_MAIL,
      subject,
      text,
    });
  }
}
