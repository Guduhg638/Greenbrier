import nodemailer from "nodemailer";

function getTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  baseUrl: string
): Promise<void> {
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;

  console.log(`[EMAIL] Verification link for ${email}: ${verifyUrl}`);

  const transporter = getTransporter();
  if (!transporter) {
    console.log("[EMAIL] No SMTP configured — verification link logged above.");
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@greenbriercirlce.app",
    to: email,
    subject: "Verify your Greenbrier Circle email address",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Verify your email</h2>
        <p>Click the button below to verify your email address and start posting reviews.</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
          Verify Email
        </a>
        <p style="color:#999;font-size:12px;margin-top:24px;">
          Link expires in 24 hours. If you didn't sign up, ignore this email.
        </p>
      </div>
    `,
  });
}
