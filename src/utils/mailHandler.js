import nodemailer from "nodemailer";
import { ApiError } from "./apiError.js";

const mailSender = async (receiver, subject, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: receiver,
      subject,
      html: body,
    });

    return info;
  } catch (error) {
    throw new ApiError(400, "Something went wrong while sending email");
  }
};

export { mailSender };
