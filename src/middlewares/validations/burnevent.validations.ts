import { body, param } from "express-validator";

export const validateBurnEvent = [
  body("eventDate")
    .isISO8601()
    .withMessage("Event date must be a valid ISO 8601 date string"),
  body("targetBurnAmount")
    .isNumeric()
    .withMessage("Target burn amount must be a number"),
  
  body("remarks").optional().isString().withMessage("Remarks must be a string"),
];
export const validateBurnEventUpdate = [
 param("id")
    .notEmpty()
    .withMessage("Burning event ID is required")
    .isMongoId()
    .withMessage("Invalid burning event ID, must be a valid MongoDB ObjectId"),
  body("eventDate")
    .optional()
    .isISO8601()
    .withMessage("Event date must be a valid ISO 8601 date string"),
  body("remarks").optional().isString().withMessage("Remarks must be a string"),
  body("targetBurnAmount")
    .optional()
    .isNumeric()
    .withMessage("Target burn amount must be a number"),
];

export const validateBurinEventId = [
  param("id")
    .notEmpty()
    .withMessage("Burning event ID is required")
    .isMongoId()
    .withMessage("Invalid burning event ID, must be a valid MongoDB ObjectId"),
];
