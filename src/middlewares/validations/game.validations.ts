import { body, param,query } from "express-validator";


export const createGameValidation = [
  body("name")
    .exists()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name should be a string"),
  
];

export const gameIdValidaton = [
  param("gameId")
    .exists()
    .withMessage("Game Id is required"),
  query("network")
    .optional()
    .trim()
    .exists()
    .withMessage("network is required")
    .isString()
    .withMessage("network should be a string")
];

export const updateGameValidation = [
  param("gameId")
    .notEmpty()
    .withMessage("Game Id is required")
    .isMongoId()
    .withMessage("Game Id should be a valid Mongo Id"),
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name should be a string")
    .optional(),
  body("imgUrl")
    .notEmpty()
    .withMessage("imgUrl is required")
    .isString()
    .withMessage("imgUrl should be a string")
    .optional(),
 
];

export const getGameHistoryValidation=[
    query('search').optional().isString().withMessage('Search must be a string'),
    query('sort').optional().isIn(['-1', '1']).withMessage('Order must be either 1 or -1'),
    query('limit').optional().isInt({gt:0}).withMessage('Limit must be a positive integer'),
    query('page').optional().isInt({gt:0}).withMessage('Page must be a positive integer')
]