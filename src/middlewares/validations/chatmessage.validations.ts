import { body,param } from "express-validator";

export const sendMessageValidator=[
    // param('id').notEmpty().withMessage("Reciever id is required").isMongoId().withMessage('Invalid reciever Id, it should be a valid MongoId'),
    body('text').notEmpty().withMessage('Message is required').isString().withMessage('Message should be a string'),
]
export const idValidator=[
    param('id').isMongoId().withMessage('Invalid user ID'),
   
]