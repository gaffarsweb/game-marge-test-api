import { query } from 'express-validator';
export const validateGameIdForPracticeGame = [
    query('gameId').optional().isMongoId().withMessage('Invalid game ID'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('sort').optional().isIn(['1', '-1']).withMessage('Sort must be either 1 or -1'),
    query('search').optional().isString().withMessage('Search must be a string')
]