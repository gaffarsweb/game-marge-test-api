import { body, param } from 'express-validator';

export const addGamergeConfigurationValidation = [
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isString()
    .withMessage("Description must be a string")
    .trim(),

  body("network")
    .notEmpty()
    .withMessage("Network is required")
    .isString()
    .withMessage("Network must be a valid string")
    .trim(),

  body("currency")
    .notEmpty()
    .withMessage("Currency is required")
    .isString()
    .withMessage("Currency must be a valid string")
    .trim(),

    body("ratePerGamerge")
    .notEmpty()
    .withMessage("Rate per Gamerge is required")
    .isNumeric()
    .withMessage("Rate per Gamerge must be a valid number")
    .trim(),

  body("maxGamergeCoins")
    .notEmpty()
    .withMessage("Max Gamerge Coins is required")
    .isInt({ min: 1 })
    .withMessage("Max Gamerge Coins must be an integer greater than 0"),

];


export const getUserGamergeCoinsValidation = [
    param("userId")
      .notEmpty()
      .withMessage("UserId is required")
      .isMongoId()
      .withMessage("UserId must be a valid MongoDB ObjectId"),
  ];

  export const buyGamergeTokens = [
    param("userId")
      .notEmpty()
      .withMessage("UserId is required")
      .isMongoId()
      .withMessage("UserId must be a valid MongoDB ObjectId"),
  
      body("gamergeTokens")
      .notEmpty()
      .withMessage("Gamerge Tokens is required")
      .isInt({ min: 1 })
      .withMessage("Gamerge Tokens must be a number and at least 1"),    
  ];


    // body("network")
    //   .notEmpty()
    //   .withMessage("Network is required")
    //   .isString()
    //   .withMessage("Network must be a valid string")
    //   .trim(),
  
    // body("currency")
    //   .notEmpty()
    //   .withMessage("Currency is required")
    //   .isString()
    //   .withMessage("Currency must be a valid string")
    //   .trim(),