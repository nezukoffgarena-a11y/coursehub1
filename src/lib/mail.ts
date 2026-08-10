import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

export function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  code: string
): Promise<void> {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.MAIL_FROM || `"Course Platform" <${process.env.SMTP_USER}>`,
    to,
    subject: "Verify your account - Course Platform",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:20px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#4f46e5;">Welcome, ${name}!</h2>
        <p>Your verification code is:</p>
        <div style="background:#eef2ff;padding:20px;border-radius:8px;text-align:center;font-size:32px;font-weight:bold;letter-spacing:8px;color:#4f46e5;">${code}</div>
        <p style="color:#6b7280;font-size:14px;">This code expires in 15 minutes.</p>
      </div>
    `,
  });
}
