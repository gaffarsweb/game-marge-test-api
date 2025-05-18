import { body } from "express-validator";

export const registerValidation = [
   body("firstName")
  .notEmpty()
  .withMessage("First Name is required")
  .isString()
  .withMessage("First Name should be a valid string")
  .trim(),
  body("lastName")
  .optional()
  .isString()
  .withMessage("Last Name should be a valid string")
  .trim(),

  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one digit")
    .matches(/[^a-zA-Z0-9]/)
    .withMessage("Password must contain at least one special character"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),

  body("referredBy")
    .optional()
    .isHexadecimal()
    .withMessage("Invalid referral code format"),

  body("country")
    .isString()
    .notEmpty()
    .withMessage("Country is required.")
    .trim(),

  body("role")
    .optional()
    .isIn(["user", "admin", "superAdmin"])
    .withMessage("Role must be either user, admin, or superAdmin"),
];

export const registerOtpValidation = [
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("otp")
    .isLength({ min: 6})
    .withMessage("OTP must be at least 6 characters long")
    .trim()
    ,
  
];
export const validateLogin = [
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
   body("password")
    .notEmpty()
    .withMessage("Password is required")
];

export const updateUserValidation = [
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
  body("firstName")
  .notEmpty()
  .withMessage("First Name is required")
  .isString()
  .withMessage("First Name should be a valid string")
  .trim()
  .optional(),
  body("lastName")
  .isString()
  .withMessage("Last Name should be a valid string")
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
  body("firstName")
    .isString()
    .withMessage("First Name must be a string")
    .notEmpty()
    .withMessage("First Name is required"),
  body("lastName")
    .optional()
    .isString()
    .withMessage("Last Name must be a string"),

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

export const validateResetPassword = [
  body("newPassword")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one digit")
    .matches(/[^a-zA-Z0-9]/)
    .withMessage("Password must contain at least one special character"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage("Passwords do not match"),

   body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("otpToken")
    .notEmpty()
    .withMessage("OTP token is required.")
    .isJWT()
    .withMessage("OTP Token should be a valid JWT Token")
    .trim(),
];

export const validateAddAdmin = [
  body("firstName")
    .notEmpty()
    .withMessage("First Name is required")
    .isString()
    .withMessage("First Name should be a valid string")
    ,

  body("lastName")
    .optional()
    .isString()
    .withMessage("First Name should be a valid string"),

  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one digit")
    .matches(/[^a-zA-Z0-9]/)
    .withMessage("Password must contain at least one special character"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),

  body("country")
    .isString()
    .notEmpty()
    .withMessage("Country is required.")
    .trim(),

  body("role")
    .notEmpty()
    .withMessage("Role is required.")
    .isIn(["admin", "superAdmin"])
    .withMessage("Role must be either admin, or superAdmin."),
];
