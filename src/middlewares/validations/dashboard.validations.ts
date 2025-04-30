import { query, ValidationChain } from "express-validator";

export const validateActiveUsersQuery: ValidationChain[] = [
  query("start")
    .optional()
    .isISO8601()
    .withMessage("Start date must be in YYYY-MM-DD format"),

  query("end")
    .optional()
    .isISO8601()
    .withMessage("End date must be in YYYY-MM-DD format"),
];
export const validateTotalUsersQuery: ValidationChain[] = [
    query("start")
      .optional()
      .isISO8601()
      .withMessage("Start date must be in YYYY-MM-DD format"),
  
    query("end")
      .optional()
      .isISO8601()
      .withMessage("End date must be in YYYY-MM-DD format"),
  ];
