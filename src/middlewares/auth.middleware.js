import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { decodeToken } from "../utils/tokenDecodeHandler.js";

//! Protect Route check token is exist and is valid
export const protectRoute = asyncHandler(async (req, _, next) => {
  try {
    //* Get token from request header and store from string
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    )
      token = req.headers.authorization.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Auth token is not found");
    }

    //* Verify Token is valid or not
    const decode = decodeToken(token);

    if (!decode) {
      throw new ApiError(401, "Invalid auth token");
    }

    const user = await User.findById(decode._id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Auth Token");
  }
});
