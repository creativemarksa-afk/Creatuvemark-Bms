import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 465,
  secure: true, // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // use App Password if Gmail
  },
});

export const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `"Creativemark" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
