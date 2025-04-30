import { body, param,query } from 'express-validator';


export const validateCreateAirdropEvent = [
  body("name").isString().notEmpty().withMessage("Name is required"),
  body("startTime").isISO8601().toDate().withMessage("Valid startTime is required"),
  body("endTime").isISO8601().toDate().withMessage("Valid endTime is required"),
  body("description").optional().isString().notEmpty().withMessage("Description can not be empty"),
  body("network")
    .exists()
    .withMessage("Network is required.")
    .isString()
    .withMessage("Network should be a valid string."),
  body("currency")
    .exists()
    .withMessage("Currency is required.")
    .isString()
    .withMessage("Currency should be a valid string.")
];

export const validateClaimAirdrop = [
  body("lootPointsToClaim") 
    .notEmpty()
    .withMessage("Loot points to claim is required")
    .isInt({ gt: 0 })
    .withMessage("Loot points to claim must be a positive integer"),
   body("airdropId")
   .notEmpty()
   .withMessage("Airdrop ID is required")
    .isMongoId()
    .withMessage("Airdrop ID must be a valid MongoDB ObjectId")
   
    
];

export const validateUpdateAirdropEvent = [
  param("id").notEmpty().withMessage("Airdrop event ID is required").isMongoId().withMessage("Airdrop Id should be a valid mongo Id"),
  body("name").optional().isString().notEmpty().withMessage("Name is required"),
  body("startTime").optional().isISO8601().toDate().withMessage("Valid startTime is required"),
  body("endTime").optional().isISO8601().toDate().withMessage("Valid endTime is required"),
  body("description").optional().isString().notEmpty().withMessage("Description can not be empty"),
  body("network")
    .optional()
    .exists()
    .withMessage("Network is required.")
    .isString()
    .withMessage("Network should be a valid string."),
  body("currency")
    .optional()
    .exists()
    .withMessage("Currency is required.")
    .isString()
    .withMessage("Currency should be a valid string.")
];

export const validateGetClaimsByAirdropId = [
  param("id").notEmpty().withMessage("Airdrop ID is required").isMongoId().withMessage("Airdrop ID must be a valid MongoDB ObjectId"),
  query("page").optional().isInt({ gt: 0 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ gt: 0 }).withMessage("Limit must be a positive integer"),
  query("status").optional().isIn(["pending", "approved", "rejected"]).withMessage("Status must be one of 'pending', 'approved', or 'rejected'"),
];

export const validateApproveClaim=[
  param("id").notEmpty().withMessage("Claim request ID is required").isMongoId().withMessage("Claim request ID must be a valid MongoDB ObjectId"),
]
export const validateDeleteAirdropEvent=[
  param("id").notEmpty().withMessage("Airdrp event ID is required").isMongoId().withMessage("Airdrop Event ID must be a valid MongoDB ObjectId"),
]
export const validateRejectClaim=[
  param("id").notEmpty().withMessage("Claim request ID is required").isMongoId().withMessage("Claim request ID must be a valid MongoDB ObjectId"),
  body("adminNote").optional().isString().withMessage("Admin Note should be a valid string")
]