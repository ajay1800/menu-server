import jwt from "jsonwebtoken";
import otp, { generate } from "otp-generator";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { mailSender } from "../utils/mailHandler.js";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";

const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refresh_token = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(500, "Something went wrong while generating token.");
  }
};

//! Register User Function
const registerUser = asyncHandler(async (req, res) => {
  //! First check username, email and password is coming in request

  const { user_name, email, password } = req.body;

  if ([user_name, email, password].some((key) => key.trim() === "")) {
    return res.status(400).json(new ApiError(400, "All field is required!"));
  }

  //! Now Check if user is already exist with email

  const existedUser = await User.findOne({ email: email });

  if (existedUser) {
    return res
      .status(400)
      .json(
        new ApiError(
          400,
          "Email already exist please login or use another email."
        )
      );
  }

  //! Now Create new user with this email and username

  const user = await User.create({
    user_name,
    email,
    password,
  });

  //! remove password and refresh token to save user data to database

  const createdUser = await User.findById(user._id).select(
    "-password -refresh_token"
  );

  //! check created user is exist otherwise return error message

  if (!createdUser) {
    return res
      .status(400)
      .json(new ApiError(400, "Something went wrong while registering user!"));
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registration successfully!"));
});

//! Login User Function
const loginUser = asyncHandler(async (req, res) => {
  //! get email and password from user

  const { email, password } = req.body;

  if ([email, password].some((key) => key.trim() === "")) {
    return res
      .status(400)
      .json(new ApiError(400, "User email and password is required!"));
  }

  //! Check user exist with given email if not then throw error

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(400)
      .json(new ApiError(404, "User not found please register user!"));
  }

  //! get user and compare it's password
  const comparePassword = await user.isPasswordCorrect(password);

  if (!comparePassword) {
    return res
      .status(400)
      .json(
        new ApiError(400, "Incorrect password Please enter correct password!")
      );
  }

  //! generate OTP and send via mail

  const OTP = generate(6, {
    lowerCaseAlphabets: false,
    specialChars: false,
    upperCaseAlphabets: false,
  });

  user.otp = OTP;
  const otpExpires = Date.now() + 5 * 60 * 1000;
  user.otp_expires = otpExpires;

  await user.save();

  let transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: "Login OTP",
    text: `Your login OTP is ${OTP}`,
    html: `<p>Your login OTP is: <strong>${OTP}</strong></p><p>Please do not share this with anyone.</p>`,
    replyTo: process.env.SMTP_EMAIL,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "OTP sent successfully!"));
});

const verifyLoginOTP = asyncHandler(async (req, res) => {
  //! get email and otp from request body
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json(new ApiError(404, "User not found"));
  }

  if (user.otp !== otp || user.otp_expires < Date.now()) {
    return res.status(400).json(new ApiResponse(400, "Invalid or expired OTP"));
  }

  user.otp = undefined;
  user.otp_expires = undefined;

  //! generate token and return user data
  const { accessToken, refreshToken } = await generateTokens(user._id);

  user.refresh_token = refreshToken;
  await user.save();
  const loggedInUser = await User.findById(user._id).select(
    "-password -refresh_token"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  const day = 24 * 60 * 60 * 1000;
  const unixTime = Date.now() + day;
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          expires_in: unixTime,
          refreshToken,
          loggedIn: true,
        },
        "User logged in successfully!"
      )
    );
});

//! logout User Function
const logoutUser = asyncHandler(async (req, res) => {
  //! Remove token from user data to logout user

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", options)
    .cookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully!"));
});

//! Refresh access token by refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
  //! get refresh token from request

  const { refresh_token } = req.body;

  if (!refresh_token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    //! check refresh token is expired or not
    const decodedToken = jwt.verify(
      refresh_token,
      process.env.REFRESH_TOKEN_SECRET
    );

    //! get user from token id and check it is exist
    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError(401, "Invalid auth token");
    }

    //! check token is expired or exist in same user
    if (refresh_token !== user.refresh_token) {
      throw new ApiError(401, "Refresh token is expired!");
    }

    //! generate new access token and refresh token
    const { accessToken, refreshToken } = await generateTokens(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    const day = 24 * 60 * 60 * 1000;
    const unixTime = Date.now() + day;
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            expires_in: unixTime,
            refreshToken,
          },
          "Token generated successfully!"
        )
      );
  } catch (err) {
    throw new ApiError(401, err?.message || "Invalid refresh token");
  }
});

//! Forgot User Password Function
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  //! check if user exist with this email

  const existedUser = await User.findOne({ email });

  if (!existedUser) {
    throw new ApiError(404, "User not exist with given email");
  }

  //! Get user details and send OTP to the given email id and store in user data base for temporary

  await createOTPHandler(req);
});

//! Reset password function
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const userId = req.user?._id;

  //! check user is exist with the email

  const existedUser = await User.findById(userId);

  if (!existedUser) {
    throw new ApiError(404, "User not exist with given email");
  }

  //! encrypt Password before update user

  const encryptPassword = await bcrypt.hash(password, 10);

  await User.findOneAndUpdate({ email }, { password: encryptPassword });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "User password update successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "Invalid User id");
  }

  const user = await User.findById(userId).select("-password -refresh-token");

  if (!user) {
    throw new ApiError(404, "User Not Found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User data fetched successfully"));
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(400, "Invalid user id");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const userData = req.body;

  const updatedUser = await User.findByIdAndUpdate(userId, userData).select(
    "-password -refresh-token"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User Updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateUserProfile,
  verifyLoginOTP,
};
