import nodemailer, {Transporter} from 'nodemailer';
import logger from './logger';

const transporter: Transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  auth:{
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error:Error | null)=>{
  if(error){
    logger.error({error},'Mailer connection failed');
  }
  else{
    logger.info('Mailer ready');
  }
});

export async function sendVerificationEmail(
  email:string,
  token:string
): Promise<void>{
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to:email,
    subject: 'Verify your email',
    html: `
      <h2>Welcome!</h2>
      <p>Click the link below to verify your email. It expires in 24 hours.</p>
      <a href="${url}">${url}</a>
    `,
  });

  logger.info({email},'Verification email sent');
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void>{
  const url = `${process.env.CLIENT_URL}/reset-password/${token}`;

await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Reset your password',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password. It expires in 1 hour.</p>
      <a href="${url}">${url}</a>
      <p>If you did not request this, ignore this email.</p>
    `,
  });

  logger.info({ email }, 'Password reset email sent');

}