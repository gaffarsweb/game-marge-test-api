import { param,body } from "express-validator";

export const validateUpdateParticapation=[
    param('participationId').isMongoId().withMessage('Participation Id must be a valid mongo Id'),
    body('status').optional().isIn(['ongoing','completed','upcoming']).withMessage('status must be ongoing or completed, upcoming'),
    body('score').optional().isNumeric().withMessage('score must be number')
]

export const validateDeleteParticapation=[
    param('id').isMongoId().withMessage('id must be a valid mongo Id')
]

export const validateCreateParticipation=[
    body('tournamentId').notEmpty().withMessage("Tournament Id is required.").isMongoId().withMessage('tournamentId must be a valid mongo Id'),
    body('userId').notEmpty().withMessage("User Id is required.").isMongoId().withMessage('userId must be a valid mongo Id'),
]