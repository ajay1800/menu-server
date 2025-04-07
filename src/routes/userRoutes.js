import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  resetPassword,
  forgotPassword,
  refreshAccessToken,
  getCurrentUser,
  updateUserProfile,
  verifyLoginOTP,
} from "../controllers/userController.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/verify-otp").post(verifyLoginOTP);
router.route("/refresh-token").post(refreshAccessToken);

//* Secured Route
router.route("/change-password").post(protectRoute, resetPassword);
router.route("/logout").post(protectRoute, logoutUser);
router.route("/get-user").get(protectRoute, getCurrentUser);
router.route("/update-profile").patch(protectRoute, updateUserProfile);

export default router;
