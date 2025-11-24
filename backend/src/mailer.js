import nodemailer from "nodemailer";

export async function sendResetEmail(to, resetUrl) {
  if (!process.env.SMTP_HOST) {
    console.log("📧 [DEV] Reset password URL:", resetUrl, "→ (no SMTP configurado)");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "no-reply@timeslot.app",
    to,
    subject: "Restablecer contraseña",
    html: `
      <p>Para restablecer tu contraseña haz clic en el botón:</p>
      <p><a href="${resetUrl}" style="display:inline-block;background:#0E3A46;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;">Restablecer</a></p>
      <p>Si no funciona, copia y pega este enlace en tu navegador:</p>
      <p>${resetUrl}</p>
    `
  });
}
