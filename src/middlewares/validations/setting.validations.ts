import { body ,param} from 'express-validator';

export const createSettingsValidation = [
  body("referral_bonus_loot_coin")
  .isNumeric()
  .notEmpty()
  .withMessage("referral_bonus_loot_coin is required."),
body("signup_bonus_loot_coin")
  .isNumeric()
  .notEmpty()
  .withMessage("signup_bonus_loot_coin is required."),
  body("signup_bonus.currency")
    .isString()
    .notEmpty()
    .withMessage("Signup bonus currency is required and must be a string."),
  body("signup_bonus.amount")
    .isNumeric()
    .withMessage("Signup bonus amount must be a number."),
  body("referral_bonus.currency")
    .isString()
    .notEmpty()
    .withMessage("Referral bonus currency is required and must be a string."),
  body("referral_bonus.amount")
    .isNumeric()
    .withMessage("Referral bonus amount must be a number."),
  body("win_deduction_percentage")
    .isNumeric()
    .withMessage("Win deduction percentage must be a number."),
  // body("win_coin_percentage")
    // .isNumeric()
    // .withMessage("Win coin percentage must be a number."),
  body("player1_referrer_percentage")
    .isNumeric()
    .withMessage("Player 1 referrer percentage must be a number."),
  body("player2_referrer_percentage")
    .isNumeric()
    .withMessage("Player 2 referrer percentage must be a number."),
  body("lootToCoinConversion")
    .isArray({ min: 1 })
    .withMessage("lootToCoinConversion must be an array of at least one item."),
  body("lootToCoinConversion.*.currency")
    .isString()
    .notEmpty()
    .withMessage("Each lootToCoinConversion item must have a currency string."),
  body("lootToCoinConversion.*.rate")
    .isNumeric()
    .withMessage("Each lootToCoinConversion item must have a numeric rate."),
];



export const updateSettingValidation = [
  body("referral_bonus_loot_coin")
    .optional()
    .isNumeric()
    .notEmpty()
    .withMessage("referral_bonus_loot_coin is required.")
    ,
  body("signup_bonus_loot_coin")
    .optional()
    .isNumeric()
    .notEmpty()
    .withMessage("signup_bonus_loot_coin is required.")
    ,

  body("signup_bonus.currency")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("Signup bonus currency must be a string."),
  body("signup_bonus.amount")
    .optional()
    .isNumeric()
    .withMessage("Signup bonus amount must be a number."),
  body("referral_bonus.currency")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("Referral bonus currency must be a string."),
  body("referral_bonus.amount")
    .optional()
    .isNumeric()
    .withMessage("Referral bonus amount must be a number."),
  body("win_deduction_percentage")
    .optional()
    .isNumeric()
    .withMessage("Win deduction percentage must be a number."),
  // body("win_coin_percentage")
  //   .optional()
  //   .isNumeric()
  //   .withMessage("Win coin percentage must be a number."),
  body("player1_referrer_percentage")
    .optional()
    .isNumeric()
    .withMessage("Player 1 referrer percentage must be a number."),
  body("player2_referrer_percentage")
    .optional()
    .isNumeric()
    .withMessage("Player 2 referrer percentage must be a number."),
  body("lootToCoinConversion")
    .optional()
    .isArray()
    .withMessage("lootToCoinConversion must be an array."),
  body("lootToCoinConversion.*.currency")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("Each lootToCoinConversion item must have a currency string."),
  body("lootToCoinConversion.*.rate")
    .optional()
    .isNumeric()
    .withMessage("Each lootToCoinConversion item must have a numeric rate."),
];
export const validateLootConversion = [
  body("currency").isString().notEmpty().withMessage("Currency is required"),
  body("rate").isNumeric().withMessage("Rate must be a number"),
];

export const validateCurrencyParam = [
  param("currency").isString().notEmpty().withMessage("Currency param is required"),
];