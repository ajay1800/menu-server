import { generate } from "otp-generator";
import { OTP } from "../models/otp.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/apiError";

//! Create OTP handler save otp in database
const createOTPHandler = async (req, res) => {
  //* get email from user input

  const { email } = req.body;

  //* generate a 6 digit OTP for sending to response

  const verificationOTP = generate(6, {
    lowerCaseAlphabets: false,
    specialChars: false,
    upperCaseAlphabets: false,
  });

  //* create new data and store otp and email in database

  const newOTP = new OTP.create({
    email,
    otp: verificationOTP,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, newOTP, "OTP Send successfully."));
};

//! Verify OTP handler check otp
const verifyOTPHandler = asyncHandler(async (req, res) => {
  //* check OTP and Email is coming from request

  const { email, otp } = req.body;

  //* check Email is exist in data base in OTP model

  const verifiedOTP = await OTP.findOne({ email })
    .sort({ createdAt: -1 })
    .limit(1);

  if (!verifiedOTP) {
    throw new ApiError(404, "OTP expires please send OTP again.");
  }

  //* check if otp is same or not

  if (verifiedOTP.length === 0 || verifiedOTP[0].otp === otp) {
    throw new ApiError(400, "Invalid OTP.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "OTP Verified successfully."));
});

export { verifyOTPHandler, createOTPHandler };
