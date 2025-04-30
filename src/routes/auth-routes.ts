import { Router } from "express";
import authController from "../controllers/auth.controller";
import {
  loginValidation,
  registerOtpValidation,
  registerValidation,
  updatePasswordValidation,
  updateUserValidation,
  validateSocialLogin,
} from "../middlewares/validations/auth.validations";
import { authenticateRequest } from "../middlewares/authMiddleware";
import { validateRequest } from "../middlewares/validateRequest";

const router = Router();



router.post(
  "/signup-request",
  registerValidation,
  validateRequest,
  authController.signupRequest
);
router.post(
  "/verify-signup-otp",
   registerOtpValidation,
   validateRequest,
  authController.verifyOtpAndSignup
);

router.post(
  "/login",
  loginValidation,
  validateRequest,
  authController.handleUserLogin
);
router.post(
  "/admin/login",
  loginValidation,
  validateRequest,
  authController.handleAdminLogin
);

router.post("/social-login",validateSocialLogin,validateRequest, authController.socialLogin);
router.post("/logout", authenticateRequest, authController.handleLogout);
router.patch(
  "/update-password",
  authenticateRequest,
  updatePasswordValidation,
  validateRequest,
  authController.updatePassword
);
router.put(
  "/update-profile",
  authenticateRequest,
  updateUserValidation,
  validateRequest,
  authController.updateProfile
);
router.get("/profile", authenticateRequest, authController.getProfile);
router.post("/forget-password-request",authController.forgotPasswordRequest);
router.post("/verify-reset-otp",authController.verifyOtpForReset);
router.post("/reset-password",authController.resetPassword);
router.post("/refresh-token",authController.refreshToken);

export default router;
