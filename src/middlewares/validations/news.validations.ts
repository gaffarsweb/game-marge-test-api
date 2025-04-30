import {param,body,query} from 'express-validator'

export const createNewsValidation=[
    body('title').isString().withMessage('Title must be a string').notEmpty().withMessage('Title is required'),
    body('description').isString().withMessage('Description must be a string').notEmpty().withMessage('Description is required'),
    body('imgUrl').isURL().withMessage('Image Url must be a valid url').notEmpty().withMessage('Image Url is required'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean').notEmpty().withMessage('isActive is required')
]

export const updateNewsValidation=[
    param('id').isMongoId().withMessage('News Id should be a valid Mongo Id'),
    body('title').optional().isString().withMessage('Title must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('imgUrl').optional().isURL().withMessage('Image Url must be a valid url'), 
]

export const deleteNewsValidation=[
    param('id').isMongoId().withMessage('News Id should be a valid Mongo Id')
]

export const getNewsValidation=[
    query('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    query('search').optional().isString().withMessage('Search must be a string'),
    query('sort').optional().isIn(['-1', '1']).withMessage('Order must be either 1 or -1'),
    query('limit').optional().isInt({gt:0}).withMessage('Limit must be a positive integer'),
    query('page').optional().isInt({gt:0}).withMessage('Page must be a positive integer')
]

export const getNewsByIdValidation=[
    param('id').isMongoId().withMessage('News Id should be a valid Mongo Id')
]