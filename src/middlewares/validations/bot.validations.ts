import {body,param} from 'express-validator';


export const createBotValidation=[
    body('name').notEmpty().withMessage('Name is required').isString().withMessage("Name should be a string"),
    body('winChance').notEmpty().withMessage("winChance is required.") .isFloat({ min: 0, max: 100 })
    .withMessage('WinChance should be a number between 0 and 100'),
    body('avatarUrl').isURL().withMessage('Avatar URL should be a valid URL').optional()
]

export const updateBotValidation=[
    param('botId').notEmpty().withMessage('Bot ID is required').isMongoId().withMessage('Bot ID should be a valid Mongo ID'),
    body('name').optional().isString().withMessage("Name should be a string").notEmpty().withMessage("Name should not be empty"),
    body('winChance').optional().isFloat({ min: 0, max: 100 })
    .withMessage('WinChance should be a number between 0 and 100'),
    body('avatarUrl').optional().isURL().withMessage('Avatar URL should be a valid URL')
]

export const paramBotIdValidation=[
    param('botId').notEmpty().withMessage('Bot ID is required').isMongoId().withMessage('Bot ID should be a valid Mongo ID'),
]