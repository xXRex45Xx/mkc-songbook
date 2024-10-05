import nodeMailer from "nodemailer";
import { config } from "dotenv";
config();

const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendEmail = async (email, title, body) => {
    const emailResponse = await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: title,
        text: body,
    });
};

export default sendEmail;
