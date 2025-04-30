import { body } from "express-validator";
export const registerValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("password")
  .notEmpty()
  .withMessage("Password is required")
  .isLength({ min: 6 })
  .withMessage("Password must be at least 6 characters long"),
  body("confirmPassword")
  .notEmpty()
  .withMessage("Confirm password is required")
  .isLength({ min: 6 })
  .withMessage("Confirm password must be at least 6 characters long"),
  body("referredBy")
  .optional()
  .isHexadecimal()
  .withMessage("Invalid referral code format")
  ,
  body("country")
    .isString()
    .notEmpty()
    .withMessage("Country is required.")
    .trim(),
  body("role")
  .optional() 
   .isIn(["user", "admin"])
    .withMessage("Role must be either user or admin")
];
export const registerOtpValidation = [
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("otp")
    .isLength({ min: 6})
    .withMessage("OTP must be at least 6 characters long")
    .trim()
    ,
  
];

export const loginValidation = [
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be 6 character long"),
];

export const updateUserValidation = [
  body("name").notEmpty().withMessage("Name is required").optional(),

  body("avatarUrl")
    .isURL()
    .withMessage("Avatar Url must be a valid URL")
    .trim()
    .optional(),

  body("country")
    .notEmpty()
    .withMessage("Country Should not be empty")
    .isString()
    .withMessage("Country must be a valid string")
    .trim()
    .optional(),
  body("name")
  .notEmpty()
  .withMessage("Name is required")
  .isString()
  .withMessage("Name should be a valid string")
  .trim()
  .optional(),
];

export const verifyOtpValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("otp")
    .isLength({ min: 6 })
    .withMessage("OTP must be at least 6 characters long"),
];

export const updatePasswordValidation = [
  body("oldPassword")
    .notEmpty()
    .withMessage("Old Password is required")
    .isLength({ min: 6 })
    .withMessage("Old Password must be 6 character long"),
  body("newPassword")
    .notEmpty()
    .withMessage("New Password is required")
    .isLength({ min: 6 })
    .withMessage("New Password must be 6 character long"),
];

export const validateSocialLogin = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .notEmpty()
    .withMessage("Name is required"),

  body("email")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail(),

  body("provider")
    .isIn(["google", "facebook"])
    .withMessage("Provider must be google, facebook."),

  body("avatarUrl")
    .isURL()
    .withMessage("avatarUrl must be a valid URL"),

  body("isEmailVerified")
    .isBoolean()
    .withMessage("isEmailVerified must be a boolean"),

  body("idToken")
    .isJWT()
    .withMessage("idToken must be a valid JWT token"),
];