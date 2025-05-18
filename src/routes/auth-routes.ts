import { Router } from "express";
import authController from "../controllers/auth.controller";
import {

  registerOtpValidation,
  registerValidation,
  updatePasswordValidation,
  updateUserValidation,
  validateAddAdmin,
  validateLogin,
  validateResetPassword,
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
  "/add-admin",
  authenticateRequest,
  validateAddAdmin,
  validateRequest,
  authController.addAdmin
);
router.post(
  "/verify-signup-otp",
   registerOtpValidation,
   validateRequest,
  authController.verifyOtpAndSignup
);
router.post(
  "/verify-admin-otp",
   registerOtpValidation,
   validateRequest,
  authController.verifyOtpForAdmin
);

router.post(
  "/login",
  validateLogin,
  validateRequest,
  authController.handleUserLogin
);
router.post(
  "/admin/login",
  validateLogin,
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
router.post("/forget-password-request-admin",authController.forgotPasswordRequestadmin);
router.post("/verify-reset-otp",authController.verifyOtpForReset);
router.post("/verify-reset-otp-admin",authController.verifyOtpForReset);
router.post("/reset-password",validateResetPassword,validateRequest,authController.resetPassword);
router.post("/reset-password-admin",validateResetPassword,validateRequest,authController.resetPassword);
router.post("/refresh-token",authController.refreshToken);

export default router;
