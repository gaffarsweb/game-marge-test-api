import { body, param } from "express-validator";


export const validateCreateAirdrop = [
  body("title").notEmpty().withMessage("Title is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("bannerImage").isURL().withMessage("Banner image must be a valid URL"),
  body("logoImage").isURL().withMessage("Logo image must be a valid URL"),
  body("logoText").notEmpty().withMessage("Logo text is required"),
  body("endAt").isISO8601().withMessage("End date must be valid"),

  body("type")
    .notEmpty().withMessage("Airdrop type is required")
    .isIn(["TASK_BASED", "ENTRY_BASED"]).withMessage("Type must be either 'TASK_BASED' or 'ENTRY_BASED'"),

  // Conditional validation for tasks (if type === TASK)
  body("tasks").if(body("type").equals("TASK_BASED"))
    .isArray({ min: 1 }).withMessage("At least one task is required"),
  body("tasks.*.title").if(body("type").equals("TASK_BASED"))
    .notEmpty().withMessage("Task title is required"),
  body("tasks.*.image").if(body("type").equals("TASK_BASED"))
    .isURL().withMessage("Task image must be a valid URL"),
  body("tasks.*.reward").if(body("type").equals("TASK_BASED"))
    .isNumeric().withMessage("Task reward must be a number"),
  body("tasks.*.link").if(body("type").equals("TASK_BASED"))
    .isURL().withMessage("Task link must be a valid URL"),

  // Conditional validation for entryCost (if type === ENTRY)
  body("entryCost").if(body("type").equals("ENTRY_BASED"))
    .isNumeric().withMessage("Entry cost is required and must be a number"),
];


export const validateUpdateAirdrop = [
  param("id").isMongoId().withMessage("Invalid airdrop campaign ID"),

  body("title").optional().notEmpty().withMessage("Title is required"),
  body("description").optional().notEmpty().withMessage("Description is required"),
  body("bannerImage").optional().isURL().withMessage("Banner image must be a valid URL"),
  body("logoImage").optional().isURL().withMessage("Logo image must be a valid URL"),
  body("logoText").optional().notEmpty().withMessage("Logo text is required"),
  body("endAt").optional().isISO8601().withMessage("End date must be valid"),

  body("type")
    .optional()
    .isIn(["TASK_BASED", "ENTRY_BASED"])
    .withMessage("Type must be either TASK_BASED or ENTRY_BASED"),

  // Entry-based validation
  body("entryCost")
    .optional()
    .isNumeric()
    .withMessage("Entry cost must be a number"),

  // Task-based validation
  body("tasks")
    .optional()
    .custom((value, { req }) => {
      if (req.body.type === "ENTRY_BASED") {
        return true; // skip tasks check for entry-based airdrop
      }
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error("At least one task is required");
      }
      return true;
    }),

  body("tasks.*.title").optional().notEmpty().withMessage("Task title is required"),
  body("tasks.*.image").optional().isURL().withMessage("Task image must be a valid URL"),
  body("tasks.*.reward").optional().isNumeric().withMessage("Task reward must be a number"),
  body("tasks.*.link").optional().isURL().withMessage("Task link must be a valid URL"),
];

export const validateClaimTask = [
  param("campaignId").isMongoId().withMessage("Invalid campaign ID"),
  param("index").isInt({ min: 0 }).withMessage("Task index must be a positive number")
];

