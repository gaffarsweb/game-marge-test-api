import { body, param,query } from "express-validator";

export const createSubGameValidation = [
  body("gameId")
    .exists()
    .withMessage("Game Id is required.")
    .isMongoId()
    .withMessage("Game Id should be a valid mongo id."),
  body("price")
    .exists()
    .withMessage("Price is required.")
    .isNumeric()
    .withMessage("Price should be a valid number."),
  body("platformFee")
    .exists()
    .withMessage("platformFee is required.")
    .isNumeric()
    .withMessage("platformFee should be a valid number."),
  body("entry")
    .notEmpty()
    .withMessage("Entry amount is required.")
    .isNumeric()
    .withMessage("Entry should be a valid number."),
  body("imgUrl")
    .optional()
    .isString()
    .withMessage("Image URL should be a valid string.")
    .isURL()
    .withMessage("Image URL should be a valid URL."),
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

export const subgameIdValidaton = [
  param("subgameId")
    .exists()
    .withMessage("Subgame Id is required")
    .isMongoId()
    .withMessage("Subgame Id should be a valid Mongo Id"),
];

export const updateSubGameValidation = [
  param("subgameId")
    .notEmpty()
    .withMessage("Subgame Id is required")
    .isMongoId()
    .withMessage("Subgame Id should be a valid Mongo Id"),
  body("price")
    .notEmpty()
    .withMessage("Price is required.")
    .isNumeric()
    .withMessage("Price should be a valid number.")
    .optional(),
  body("platformFee")
    .exists()
    .withMessage("platformFee is required.")
    .isNumeric()
    .withMessage("platformFee should be a valid number."),
  body("entry")
    .notEmpty()
    .withMessage("Entry amount is required.")
    .isNumeric()
    .withMessage("Entry should be a valid number.")
    .optional(),
    body("imgUrl")
    .optional()
    .isString()
    .withMessage("Image URL should be a valid string.")
    .isURL()
    .withMessage("Image URL should be a valid URL."),
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

export const validateGetSubgamesForApp = [
    query('gameId').optional().isMongoId().withMessage('Invalid game ID'),
    query('status').optional().isIn(['upcoming', 'ongoing', 'completed']).withMessage('Invalid status'),
    query("network")
    .optional()
    .trim()
    .exists()
    .withMessage("network is required")
    .isString()
    .withMessage("network should be a string")
]