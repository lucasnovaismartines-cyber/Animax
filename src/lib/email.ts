
import nodemailer from 'nodemailer';
import { env } from './env';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, code: string) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[DEV MODE] Email verification code for ${email}: ${code}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Animax" <noreply@animax.click>',
      to: email,
      subject: 'Código de Verificação - Animax',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin: 0; padding: 0; background-color: #000000; font-family: 'Arial', sans-serif; color: #ffffff; }
            .container { max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #333; border-radius: 16px; overflow: hidden; margin-top: 40px; }
            .header { background: linear-gradient(90deg, #7c3aed 0%, #0891b2 100%); padding: 30px 20px; text-align: center; }
            .logo { font-size: 32px; font-weight: 900; color: #ffffff; letter-spacing: -2px; font-style: italic; margin: 0; text-shadow: 0 2px 10px rgba(0,0,0,0.3); }
            .content { padding: 40px 30px; text-align: center; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 20px; color: #f3f4f6; }
            .text { font-size: 16px; line-height: 1.6; color: #9ca3af; margin-bottom: 30px; }
            .code-box { background-color: #1a1a1a; border: 1px solid #7c3aed; border-radius: 12px; padding: 20px; margin: 0 auto 30px; display: inline-block; min-width: 200px; }
            .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #a78bfa; font-family: 'Courier New', monospace; margin: 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #4b5563; border-top: 1px solid #262626; background-color: #050505; }
            .highlight { color: #22d3ee; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo">ANIMAX</h1>
            </div>
            <div class="content">
              <h2 class="title">Verificação de Segurança</h2>
              <p class="text">Olá! Use o código abaixo para validar sua ação no <span class="highlight">Animax</span>.</p>
              
              <div class="code-box">
                <p class="code">${code}</p>
              </div>
              
              <p class="text" style="font-size: 14px; margin-bottom: 0;">Este código expira em 15 minutos.</p>
              <p class="text" style="font-size: 14px; margin-top: 5px;">Se você não solicitou este código, ignore este email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Animax Streaming. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
    // Fallback for dev/demo if email fails
    console.log(`[FALLBACK] Email verification code for ${email}: ${code}`);
  }
}
