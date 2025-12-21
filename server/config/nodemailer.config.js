import nodemailer from 'nodemailer';

// Create a test account or replace with real credentials
const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP,
    post: process.env.BREVO_PORT,
    auth: {
        user: process.env.BREVO_SENDER_USER,
        pass: process.env.BREVO_SENDER_PASS,
    },
})

export const sendEmail = async ({ to, subject, body, }) => {
    const response = await transporter.sendMail({
        from: process.env.BREVO_SENDER_EMAIL,
        to: to,
        subject: subject,
        html: body,
    });

    return response;
}