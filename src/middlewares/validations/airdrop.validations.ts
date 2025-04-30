import { body, param } from "express-validator";

export const validateCreateAirdrop = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("bannerImage").isURL().withMessage("Banner image must be a valid URL"),
  body("logoImage").isURL().withMessage("Logo image must be a valid URL"),
  body("logoText").notEmpty().withMessage("Logo text is required"),
  body("endAt").isISO8601().withMessage("End date must be valid"),
  body("tasks").isArray({ min: 1 }).withMessage("At least one task is required"),
  body("tasks.*.title").notEmpty().withMessage("Task title is required"),
  body("tasks.*.image").isURL().withMessage("Task image must be a valid URL"),
  body("tasks.*.reward").isNumeric().withMessage("Task reward must be a number"),
  body("tasks.*.link").isURL().withMessage("Task link must be a valid URL")
];
export const validateUpdateAirdrop = [
  param("id").isMongoId().withMessage("Invalid airdroop campaign ID"),
  body("title").optional().notEmpty().withMessage("Title is required"),
  body("description").optional().notEmpty().withMessage("Description is required"),
  body("bannerImage").optional().isURL().withMessage("Banner image must be a valid URL"),
  body("logoImage").optional().isURL().withMessage("Logo image must be a valid URL"),
  body("logoText").optional().notEmpty().withMessage("Logo text is required"),
  body("endAt").optional().isISO8601().withMessage("End date must be valid"),
  body("tasks").optional().isArray({ min: 1 }).withMessage("At least one task is required"),
  body("tasks.*.title").optional().notEmpty().withMessage("Task title is required"),
  body("tasks.*.image").optional().isURL().withMessage("Task image must be a valid URL"),
  body("tasks.*.reward").optional().isNumeric().withMessage("Task reward must be a number"),
  body("tasks.*.link").optional().isURL().withMessage("Task link must be a valid URL")
];

export const validateClaimTask = [
  param("campaignId").isMongoId().withMessage("Invalid campaign ID"),
  param("index").isInt({ min: 0 }).withMessage("Task index must be a positive number")
];

