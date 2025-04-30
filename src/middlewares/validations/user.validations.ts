import {body, query} from 'express-validator';
export const updateUserProfileValidation = [
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
  body("role")
  .notEmpty()
  .withMessage("Role is required")
  .isString()
  .withMessage("Role should be a valid string")
  .trim()
  .optional(),
  body("isActive")
  .notEmpty()
  .withMessage("Role is required")
  .isBoolean()
  .withMessage("isActive should be a boolean")
  .trim()
  .optional(),
];

export const getAllUsers = [
    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be an integer greater than 0"),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be an integer between 1 and 100"),

    query("search")
        .optional()
        .isString()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Search must be a string up to 100 characters long"),
    
    query("sort")
        .optional()
        .customSanitizer(value => value.replace(/^"|"$/g, ''))
        .isIn(["newest", "oldest", "highest", "lowest"])
        .withMessage("Sort must be either 'newest' or 'oldest'"),
]
