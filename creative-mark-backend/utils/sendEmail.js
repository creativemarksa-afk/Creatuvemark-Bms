// utils/sendEmail.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (to, subject, html) => {
  try {
    const response = await resend.emails.send({
        from: `CreativeMark <${process.env.FROM_EMAIL}>`, // must be verified in Resend
        to,
        subject,
        html
      });
    console.log('Email sent successfully:', response.id);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
