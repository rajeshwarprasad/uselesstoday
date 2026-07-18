let sendMail;

if (process.env.RESEND_API_KEY) {
    const { Resend } = require("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    sendMail = async ({ to, subject, html }) => {
        return resend.emails.send({
            from: process.env.EMAIL_FROM || "FlowUpBoard <onboarding@resend.dev>",
            to,
            subject,
            html,
        });
    };
} else {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 465,
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    sendMail = async ({ to, subject, html }) => {
        return transporter.sendMail({
            from: `"FlowUpBoard" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
    };
}

module.exports = { sendMail };
