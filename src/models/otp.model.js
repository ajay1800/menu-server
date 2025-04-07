import mongoose from "mongoose";
import { ApiError } from "../utils/apiError";
import { mailSender } from "../utils/mailHandler";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5,
  },
});

async function sendVerificationMail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification email",
      `
      <h1>Please confirm your OTP</h1>
      <p>Here is your OTP code: ${otp}</p>`
    );
  } catch (error) {
    throw new ApiError(400, "Something went wrong while sending mail.");
  }
}

otpSchema.pre("save", async function (next) {
  if (this.isNew) {
    await sendVerificationMail(this.email, this.otp);
  }
  next();
});

export const OTP = mongoose.Model("OTP", otpSchema);
