import { body, param, query } from 'express-validator';


export const validateCreateTournament = [
    body('gameId').isMongoId().withMessage('Invalid game ID'),
    body('name').notEmpty().withMessage('Name is required'),
    body('startTime').isISO8601().withMessage('Invalid start time'),
    body('endTime').isISO8601().withMessage('Invalid end time'),
    body('entryFee').isNumeric().withMessage('Entry fee must be a number'),
    body('winningPrice').isNumeric().withMessage('Winning price must be a number'),
    body('currency').notEmpty().withMessage('Currency is required'),
    body('network').notEmpty().withMessage('network is required'),
    body('bannerImage').notEmpty().withMessage('Banner image is required'),
    body('rewardDistribution').isArray().withMessage('Reward distribution must be an array'),
    body('rewardDistribution.*.position').isNumeric().withMessage('Position must be a number'),
    body('rewardDistribution.*.amount').isNumeric().withMessage('Amount must be a number')
]

export const validateUpdateTournament = [
    param("id").isMongoId().withMessage("Tournament ID should be a valid mongo Id"),
    body('name').optional().notEmpty().withMessage('Name is required'),
    body('status').optional().isIn(['upcoming', 'ongoing', 'completed']).withMessage('Invalid status'),
    body('startTime').optional().isISO8601().withMessage('Invalid start time'),
    body('endTime').optional().isISO8601().withMessage('Invalid end time'),
    body('entryFee').optional().isNumeric().withMessage('Entry fee must be a number'),
    body('winningPrice').optional().isNumeric().withMessage('Winning price must be a number'),
    body('currency').optional().notEmpty().withMessage('Currency is required'),
    body('network').optional().notEmpty().withMessage('network is required'),
    body('bannerImage').optional().notEmpty().withMessage('Banner image is required'),
    body('rewardDistribution').optional().isArray().withMessage('Reward distribution must be an array'),
    body('rewardDistribution.*.position').optional().isNumeric().withMessage('Position must be a number'),
    body('rewardDistribution.*.amount').optional().isNumeric().withMessage('Amount must be a number')
]

export const validateGetTournaments = [
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

export const validateGetTournamentById = [
    param('id').isMongoId().withMessage('Invalid tournament ID')
]
export const validateDeleteTournament = [
    param('id').isMongoId().withMessage('Invalid tournament ID')
]


export const validateGetTournamentsDetailsForAdmin = [
    param('id').isMongoId().withMessage('Invalid tournament ID'),
    // query("page")
    // .optional()
    // .isInt({ min: 1 })
    // .withMessage("Page must be a positive integer"),

    //   query("limit")
    //     .optional()
    //     .isInt({ min: 1 })
    //     .withMessage("Limit must be a positive integer"),

    //     query("sortBy")
    //     .optional()
    //     .isIn(["score", "entryAt", "createdAt"])
    //     .withMessage("Invalid sortBy field"),
    //     query('order').optional().isIn(['asc', 'desc']).withMessage('Invalid order'),
    //     query('email').isString().trim()
]
export const getTournamentParticipationsValidation = [
    param('id').isMongoId().withMessage('Invalid tournament ID'),

    query("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be an integer greater than 0"),

    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be an integer between 1 and 100"),

    query("search")
        .optional()
        .isString()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Search must be a string up to 100 characters long"),
    
    query("sort")
        .optional()
        .customSanitizer(value => value.replace(/^"|"$/g, ''))
        .isIn(["newest", "oldest", "highest", "lowest"])
        .withMessage("Sort must be either 'newest' or 'oldest'"),
]

